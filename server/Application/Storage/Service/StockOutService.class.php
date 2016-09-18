<?php

/*
 * @app Storage
 * @package Storage.service.StockOut
 * @author laofahai@TEam Swift
 * @link http://ng-erp.com
 * */
namespace Storage\Service;

use Common\Service\CommonBillService;

class StockOutService extends CommonBillService {

    // 已部分入库
    const STATUS_PART = 2;
    // 已完全入库
    const STATUS_COMPLETE = 3;

    // 锁定状态
    protected $LOCKED_STATUS = [
        self::STATUS_SAVED,
        self::STATUS_PART,
        self::STATUS_COMPLETE
    ];

    // 单据主表模型别名 必须
    protected $main_model_alias = 'storage.stockOut';
    // 单据行模型别名 必须
    protected $detail_model_alias = 'storage.stockOutDetail';
    // 主表外键字段
    protected $detail_main_foreign = 'stock_out_id';
    // 主表表名
    protected $main_table = 'stock_out';
    // 明细表表名
    protected $detail_table = 'stock_out_detail';

    // 余额方向
    protected $balance_direction = 'out';
    // 包含本次可出库数量
    protected $include_this_time_quantity = true;

    /*
     * 「工作流接口」
     * 保存出库单
     * 检测数据完整
     * */
    public function save_stock_out($id) {

        $detail_service = D('Storage/StockOutDetail');
        $rows = $detail_service->where(['stock_out_id'=>$id])->select();
        $needed = [
            'quantity', 'product_id', 'product_unique_id', 'storage_id', 'stock_out_id'
        ];
        $result = check_params_full_multi($rows, $needed);
        if(true !== $result) {
            $this->error = _('common.Params Error') .':'. implode(',', $result);
            return false;
        }

        $this->update_field_data($id, 'status', self::STATUS_SAVED);
    }

    /*
     * 「工作流接口」
     * 确认出库
     * @todo 检测库存是否足够，并可配置允许负库存产生
     * */
    public function confirm_stock_out($id, $current_node) {
        if(!I('get.workflow_submit')) {
            return [
                'pause' => 'true',
                'type'=> 'redirect',
                'url' => '/storage/stockOut/confirm/bill/' . $id . '/node/' . $current_node['id']
            ];
        }

        $meta = $this->where(['id'=>$id])->find();

        $detail_service = D('Storage/StockOutDetail');
        $stock_service = D('Storage/Stock');
        $log_service = D('Storage/StockLog');

        $this->startTrans();
        $rows = I('post.rows');
        foreach($rows as $k=>$row) {
            if(!$row['id']
                || !$row['this_time_out_quantity']
                || !$row['storage_id']
                || !$row['product_id']
                || !$row['product_unique_id']
            ) {
                continue;
            }
            $detail_service->where(['id'=>$row['id']])->setInc('already_out', $row['this_time_out_quantity']);

            $rows[$k]['quantity'] = $row['this_time_out_quantity'];
            // 写库存操作记录
            if(false === $log_service->record([
                    'source_model' => 'storage.stockOut',
                    'source_id'    => $id,
                    'bill_no'      => $meta['bill_no'],
                    'direction'    => 'out',
                    'product_id'   => $row['product_id'],
                    'product_unique_id' => $row['product_unique_id'],
                    'quantity'     => $row['this_time_out_quantity'],
                    'storage_id'   => $row['storage_id']
                ])) {

                $this->error =__('storage.Trigger error when record stock log');
                $this->rollback();
                return false;
            }

        }

        // 更新库存清单
        if(false === $stock_service->change_quantity('-', $rows)) {
            $this->error = __('storage.Trigger error when update stock balance');
            $this->rollback();
            return false;
        }

        $this->commit();

        return [
            'type'=> 'redirect',
            'url' => '/storage/stockOut/view/bill/' . $id
        ];
    }

    /*
     * 「工作流接口」
     * 检测是否已完全出库
     * */
    public function check_if_all_out($id) {
        $rows = D('Storage/StockOutDetail')->where(['stock_out_id'=>$id])->select();
        if(!$rows) {
            return false;
        }

        foreach($rows as $row) {
            if($row['quantity'] > $row['already_out']) {
                $this->update_field_data($id, 'status', self::STATUS_PART);
                return false;
            }
        }

        $this->update_field_data($id, 'status', self::STATUS_COMPLETE);
        return true;
    }


}