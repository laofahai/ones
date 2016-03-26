<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 7/31/15
 * Time: 23:13
 */

namespace Common\Service;
use Common\Lib\Schema;
use Common\Model\CommonModel;
use Home\Service\AppService;
use MessageCenter\Service\MessageCenter;


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
class CommonBillService extends CommonModel {

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

    // 相关的单据模型
    public $related_module = [];

    protected $include_this_time_quantity = false;
    protected $balance_direction;

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
            $this->set_error(__('common.System Error') . ' PARAM ' . $check, 3001, false);
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
            $this->set_error(__('common.Create Data Object Failed') . ':' . $this->main_model_alias, 3002);
            $this->rollback();
            return false;
        }

        $id = $this->add();
        if(!$id) {
            $this->set_error(__('common.Insert Data Failed') . ':' . $this->main_model_alias, 3003);
            $this->rollback();
            return false;
        }

        /*
         * 通过消息中心广播事件
         * */
        $app_alias = lcfirst(MODULE_NAME);
        $module_alias = lcfirst(CONTROLLER_NAME);
        MessageCenter::broadcast(['add', 'add_bill'], [
            "id" => $id,
            "bill_no" => $meta['bill_no'],
            "subject" => $meta['subject'] . ' ' . $meta['bill_no'],
            "user_info_id" => $meta['user_info_id'],
            "module"  => $app_alias.'.'.$module_alias,
            "link"    => sprintf("%s/%s/view/bill/%d", $app_alias, $module_alias, $id)
        ]);

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
            if(!$row['product_unique_id']) {
                $row['product_unique_id'] = $product_unique_id = generate_product_unique_id($row, $attribute_fields);
            }

            $row[$this->detail_main_foreign] = $id;

            if(false === $detail_service->create($row)) {
                $this->set_error(__('common.Create Data Object Failed') . ':' . $this->detail_model_alias, 3004);
                $this->rollback();
                return false;
            }

            $row_id = $detail_service->add();
            if(!$row_id) {
                $this->set_error(__('common.Insert Detail Data Failed') . ':' . $this->detail_model_alias, 3005);
                $this->rollback();
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
        if($meta['workflow_id']) {
            $meta_data = [
                'remark' => $meta['remark']
            ];
            $workflow_service = D('Bpm/Workflow');
            $workflow_result = $workflow_service->start_progress($meta['workflow_id'], $id, $meta_data);
            if(false === $workflow_result) {
                $this->error = $workflow_service->getError();
                $this->rollback();
                return false;
            }
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
        $this->create($meta);
        if(false === $this->save()) {
            $this->error = __('storage.Trigger when save meta data');
            $this->rollback();
            return false;
        }

        /*
         * 通过消息中心广播事件
         * */
        $app_alias = lcfirst(MODULE_NAME);
        $module_alias = lcfirst(CONTROLLER_NAME);
        MessageCenter::broadcast(['edit', 'edit_bill'], [
            "id" => $id,
            "bill_no" => $meta['bill_no'],
            "subject" => $meta['subject'] . ' ' . $meta['bill_no'],
            "user_info_id" => $meta['user_info_id'],
            "module"  => $app_alias.'.'.$module_alias,
            "link"    => sprintf("%s/%s/view/bill/%d", $app_alias, $module_alias, $id)
        ]);

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

            if(array_key_exists($product_unique_id, $exists_rows)) {
                // 存在行
//                $row['id'] = $exists_rows[$product_unique_id]['id'];
                $detail_service->create($row);
                $detail_service->save();
//                $detail_service->where([
//                    'id' => $exists_rows[$product_unique_id]['id']
//                ])->save($row);
//
//                echo $detail_service->getLastSql();exit;

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
     * 获取单据所有信息，包括基本信息、明细信息、工作流进程明细, 以及相关单据
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

        // 本次出入库数量
        if($this->include_this_time_quantity && $this->balance_direction) {
            foreach($rows as $k=>$v) {
                $this_time_quantity_field = sprintf('this_time_%s_quantity', $this->balance_direction);
                $rows[$k][$this_time_quantity_field] = round($v['quantity'] - $v['already_'.$this->balance_direction], DBC('decimal_scale'));
            }
        }
        $rows = Schema::data_format($rows, $this->detail_table, true);

        // 工作流进程
        $progress_service = D('Bpm/WorkflowProgress');
        $meta['workflow_progress'] = $progress_service->get_progress($meta['workflow_id'], $meta['id']);

        $meta['workflow_latest_progress'] = end($meta['workflow_progress']);

        /*
         * 获取相关单据
         *
         * 正反向获得
         * 正向: 当前meta数据中包含source_model和source_id, 则通过此信息进行查询
         * 反向: 当前子类包含$related_model属性, 通过$related_model.source_model=$this->main_model_alias && $related_model.source_id==$id进行查询
         * */
        $meta['related_bill'] = [];
        if($meta['source_model'] && $meta['source_id']) {
            $related_model_name = model_alias_to_name($meta['source_model']);
            $related_model = D($related_model_name);
            $related_bill = $related_model->where([
                'id' => $meta['source_id']
            ])->find();

            list($app, $module) = explode('.', $meta['source_model']);

            $related_bill['bill_type_label'] = __($app.'.'.camelCaseSpace($module));
            if($related_bill) {
                array_push($meta['related_bill'], $related_bill);
            }
        }
        foreach($this->related_module as $rm) {
            list($app, $module) = explode('.', $rm);
            if(!AppService::is_app_active($app)) {
                continue;
            }
            $related_model_name = model_alias_to_name($rm);
            $related_model = D($related_model_name);

            $related_bills = $related_model->where([
                'source_model' => $this->main_model_alias,
                'source_id' => $id
            ])->select();

            if($related_bills) {
                foreach($related_bills as $bill) {
                    $bill['bill_type_label'] = __($app.'.'.camelCaseSpace($module));
                    array_push($meta['related_bill'], $bill);
                }
            }
        }

        foreach($meta['related_bill'] as $k=>$rb) {
            $meta['related_bill'][$k]['workflow_latest_progress'] =
                $progress_service->get_latest_progress($rb['workflow_id'], $rb['id']);

        }

        // 产品属性
        if(AppService::is_app_active('productAttribute')) {
            $rows = D('ProductAttribute/ProductAttribute')->assign_to_by_product_unique($rows, $this->detail_model_alias);
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
            if($row['product_unique_id']) {
                $unique_key = sprintf('%s_%s', $row['product_unique_id'], $row['storage_id']);
            } else {
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
     * 「工作流接口」
     * 完成单据操作后的回调,响应至[等待相应节点]
     * */
    public function response_to_outside($id) {
        $bill = $this->where(['id'=>$id])->find();
        if(!$bill['source_model'] || !$bill['source_id']) {
            return;
        }

        $result = D('Bpm/Workflow')->response_to_node($bill['source_model'], $bill['source_id'], $bill);
        return false === $result ? "" : $result;
    }

}