<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 7/31/15
 * Time: 23:13
 */

namespace Common\Model;
use Common\Lib\Schema;
use Home\Service\AppService;


/*
 * 通用单据模型，此处单据泛指使用到商品、数量、仓库等部分的单据。如：销售单、采购单、入库单、出库单、调拨单等等。
 *
 * 子类需定义：
 *  * $main_model_alias storage.stockIn 主表模型(模块)别名
 *  * $detail_model_alias storage.stockInDetail 明细表模型（模块）别名
 *
 * 此模型实现了几个通用的方法
 *  * CommonBillModel::is_locked($status)  返回单据是否是锁定状态
 *  * CommonBillModel::add_bill($meta, $rows)  新增单据
 *  * CommonBillModel::edit_bill($id, $meta, $rows)  修改单据
 *  * CommonBillModel::get_full_data($id) 返回包含单据主表、明细表、工作流、产品属性等等所有信息
 *
 * */
class CommonBillModel extends CommonModel {

    // 默认包含的两种状态，可继续定义常量
    const STATUS_NEW = 0;
    const STATUS_SAVED = 1;

    protected $LOCKED_STATUS = [];

    // 单据主表模型别名 必须
    protected $main_model_alias;
    // 单据行模型别名 必须
    protected $detail_model_alias;
    // 主表外键字段
    protected $detail_main_foreign;
    // 主表表名
    protected $main_table;
    // 明细表表名
    protected $detail_table;

    protected $main_model;
    protected $detail_model;

    protected $_auto = [
        array("user_info_id", "get_current_user_id", 1, "function"),
        array("company_id", "get_current_company_id", 1, "function")
    ];

    public function __construct() {
        parent::__construct();

        $this->main_model = model_alias_to_name($this->main_model_alias);
        $this->detail_model = model_alias_to_name($this->detail_model_alias);
    }

    public function is_locked($status) {
        return in_array($status, $this->LOCKED_STATUS);
    }

    /*
     * 新增单据接口
     *
     * @param array $meta = [
     *  bill_no: 默认自动生成
     *  subject: 主题
     *  bill_no: 默认可自动生成
     *  quantity: 默认自动统计总数量
     *  remark: 总备注，默认为空
     *  workflow_id: 工作流ID，默认为storage.stockIn默认工作流
     * ]
     *
     * @param array $rows = [[
     *  quantity: 数量
     *  product_id: 产品ID
     *  remark: 行备注，默认为空
     * ]]
     *
     * @return integer $id 单据ID
     *
     * @todo 合并相同行，依据product_id + attr_id
     *
     * */
    public function add_bill($meta, $rows) {

        $check = $this->check_params();
        if(true !== $check) {
            $this->error = __('common.System Error') . ' PARAM ' . $check;
            return false;
        }

        /*
         * 插入主表数据
         * */
        $meta['status'] = self::STATUS_NEW;
        // 统计
        if(!$meta['quantity']) {
            $quantity = 0;
            $row_quantity = get_array_by_field($rows, 'quantity');
            foreach($row_quantity as $v) {
                $quantity += $v;
            }

            $meta['quantity'] = decimal_scale($quantity);
        }


        $this->startTrans();

        if(false === $this->create($meta)) {
            $this->rollback();
            $this->error = __('common.Create Data Object Failed') . ':' . $this->main_model_alias;
            return false;
        }

        $id = $this->add();

        if(!$id) {
            $this->rollback();
            $this->error = __('common.Insert Data Failed') . ':' . $this->main_model_alias;
            return false;
        }

        /*
         * 产品属性
         * */
        if(AppService::is_app_active('productAttribute')) {
            $attribute_active = true;
            $attribute_service = D('ProductAttribute/ProductAttribute');

            // 所有的产品属性字段
            $attribute_fields = $attribute_service->get_attribute_fields();
        }

        /*
         * 合并相同行
         * */
        $rows = $this->merge_same_rows($rows, $attribute_fields);

        /*
         * 插入明细表数据
         * */
        $detail_service = D($this->detail_model);
        foreach($rows as $row) {
            $row['product_unique_id'] = $product_unique_id = generate_product_unique_id($row, $attribute_fields);
            $row[$this->detail_main_foreign] = $id;

            if(false === $detail_service->create($row)) {
                $this->rollback();
                $this->error = __('common.Create Data Object Failed') . ':' . $this->detail_model_alias;
                return false;
            }

            $row_id = $detail_service->add();
            if(!$row_id) {
                $this->rollback();
                $this->error = __('common.Insert Data Failed') . ':' . $this->detail_model_alias;
                return false;
            }

            // 记录产品属性与明细行之间的关系
            $row['id'] = $row_id;
            if($attribute_active) {
                $this->record_detail_attribute($id, $row, $attribute_fields);
            }
        }

        /*
         * 开始执行工作流
         * */
        $meta_data = [
            'remark' => $meta['remark']
        ];
        $workflow_service = D('Bpm/Workflow');
        if(false === $workflow_service->start_progress($meta['workflow_id'], $id, $meta_data)) {
            $this->error = $workflow_service->getError();
            $this->rollback();
            return false;
        }

        $this->commit();

        return $id;
    }

    public function edit_bill($id, $meta, $rows) {

        if(!$this->check_params()) {
            $this->error = __('common.System Error');
            return false;
        }

        $old_meta = $this->where(['id'=>$id])->find();

        // 获得当前数据状态，判断是否可修改
        if(in_array($old_meta['status'], $this->LOCKED_STATUS)) {
            $this->error = __('workflow.Can not be edit this item because the data is in progress');
            return false;
        }

        /*
         * 产品属性
         * */
        if(AppService::is_app_active('productAttribute')) {
            $attribute_active = true;
            $attribute_service = D('ProductAttribute/ProductAttribute');

            // 所有的产品属性字段
            $attribute_fields = $attribute_service->get_attribute_fields();
        }

        // 更新meta信息
        // 统计
        if(!$meta['quantity']) {
            $quantity = 0;
            $row_quantity = get_array_by_field($rows, 'quantity');
            foreach($row_quantity as $v) {
                $quantity += $v;
            }

            $meta['quantity'] = decimal_scale($quantity);
        }

        foreach($meta as $k=>$v) {
            if(is_array($v)) {
                unset($meta[$k]);
            }
        }

        $this->startTrans();
        if(false === $this->where(['id'=>$id])->save($meta)) {
            $this->error = __('storage.Trigger when save meta data');
            $this->rollback();
            return false;
        }

        // 获取已存在数据
        $detail_service = D($this->detail_model);
        $exists_rows = $detail_service->where([$this->detail_main_foreign => $id])->select();
        $exists_rows = get_array_to_ka($exists_rows, 'product_unique_id');

        // 已存在ID数组
        $exists_ids = get_array_by_field($exists_rows, 'id');
        // 修改的ID数组
        $edited_ids = '';

        $rows = $this->merge_same_rows($rows, $attribute_fields);

        /*
         * 更新行信息
         * 1、 已存在行，尝试判断数量等信息
         * 2、 未存在行插入
         * 3、 删除行删除
         * */
        foreach($rows as $row) {
            $row['product_unique_id'] = $product_unique_id = generate_product_unique_id($row, $attribute_fields);

            if(array_key_exists($product_unique_id, $exists_rows) && $row['storage_id'] === $exists_rows[$product_unique_id]['storage_id']) {
                // 存在行
                $detail_service->where([
                    'id' => $exists_rows[$product_unique_id]['id']
                ])->save([
                    'quantity' => $row['quantity']
                ]);

                array_push($edited_ids, $exists_rows['id']);
                $row['id'] = $exists_rows[$product_unique_id]['id'];
            } else {
                // 不存在行 插入
                $row[$this->detail_main_foreign] = $id;
                $detail_service->create($row);
                $row['id'] = $row_id = $detail_service->add();
            }

            // 更新属性map
            if($attribute_active) {
                $this->record_detail_attribute($id, $row, $attribute_fields);
            }
        }

        // 删除未使用的明细条目
        $need_delete = array_diff($exists_ids, $edited_ids);
        $detail_service->where([
            'id' => ['IN', $need_delete]
        ])->delete();

        $this->commit();
    }

    /*
     * 获取单据所有信息，包括基本信息、明细信息、工作流进程明细、下一流程节点
     * */
    public function get_full_data($id) {

        if(!$this->check_params()) {
            $this->error = __('common.System Error');
            return false;
        }

        $meta = D($this->main_model, 'Model')->where(['id'=>$id])->find();

        if(!$meta) {
            // @todo error_message
            return false;
        }

        if($this->is_locked($meta['status'])) {
            $meta['locked'] = true;
        }
        $meta = Schema::data_format($meta, $this->main_table, true);

        $detail_model = D($this->detail_model, 'Model');
        $rows = $detail_model->where([$this->detail_main_foreign=>$id])->select();
        $rows = Schema::data_format($rows, $this->detail_table, true);

        // 工作流进程
        $progress_service = D('Bpm/WorkflowProgress');
        $meta['workflow_progress'] = $progress_service->get_progress($meta['workflow_id'], $meta['id']);

        // 产品属性
        if(AppService::is_app_active('productAttribute')) {
            $rows = D('ProductAttribute/ProductAttribute')->assign_to($rows, $this->detail_model_alias);
        }

        return [
            'meta' => $meta,
            'rows' => $rows
        ];
    }

    /*
     * 检测子类是否正确设定参数
     * */
    final protected function check_params() {
        if(!$this->LOCKED_STATUS) {
            return 'LOCKED_STATUS';
        }
        $needed = [
            'main_model_alias',
            'detail_model_alias',
            'detail_main_foreign',
            'main_table',
            'detail_table'
        ];
        foreach($needed as $n) {
            if(!$this->$n) {
                return $n;
            }
        }

        return true;
    }

    /*
     * 合并相同行
     * */
    final protected function merge_same_rows($rows, $attribute_fields) {
        $cleaned_rows = [];
        foreach($rows as $row) {
            if($attribute_fields) {
                $unique_key = sprintf(
                    '%d_%s_%d',
                    $row['product_id'],
                    implode('_', filter_array_fields($row, $attribute_fields)),
                    $row['storage_id']
                );
            } else {
                $unique_key = $row['product_id'] + '_' + $row['storage_id'];
            }

            if(array_key_exists($unique_key, $cleaned_rows)) {
                $cleaned_rows[$unique_key]['quantity'] += $row['quantity'];
                continue;
            }

            $cleaned_rows[$unique_key] = $row;
        }
        return reIndex($cleaned_rows);
    }

    /*
     * 记录明细行与属性之间的关系
     * @param integer $main_id 主数据ID
     * @param array $row 明细单行
     * @param array $attribute_fields 属性字段列表
     * @todo 记录使用频率
     * */
    final protected function record_detail_attribute($main_id, $row, $attribute_fields) {
        $attribute_map_service = D('ProductAttribute/ProductAttributeMap');

        $product_unique_id = [$row['product_id']];

        // 删除原数据
        $attribute_map_service->where([
            'source_id' => $main_id,
            'source_model' => $this->detail_model_alias
        ])->delete();

        foreach($attribute_fields as $attr) {
            if(array_key_exists($attr['alias'], $row)) {
                $attr_content = [
                    'source_model' => $this->detail_model_alias,
                    'source_id'    => $row['id'],
                    'product_attribute_content_id' => $row[$attr['alias']],
                    'product_attribute_id' => $attr['id']
                ];
                if(false === $attribute_map_service->create($attr_content)) {
                    $this->rollback();
                    $this->error = __('common.Insert Data Failed') . ': productAttribute ' . $this->getDbError();
                    return false;
                }
                $attribute_map_service->add();

                array_push($product_unique_id, sprintf('%d_%d', $attr['id'], $row[$attr['alias']]));
            }
        }

        return implode('|', $product_unique_id);
    }

    /*
     * 生成商品唯一ID
     * */
    final protected function generate_product_unique_id($row, $attribute_fields) {
        $product_unique_id = [$row['product_id']];
        foreach($attribute_fields as $attr) {
            array_push($product_unique_id, sprintf('%d_%d', $attr['id'], $row[$attr['alias']]));
        }

        return implode('|', $product_unique_id);
    }

}