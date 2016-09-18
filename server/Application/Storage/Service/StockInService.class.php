<?php

namespace Storage\Service;
use Common\Service\CommonBillService;

class StockInService extends CommonBillService {

    // 新建入库单
    const STATUS_NEW = 0;
    // 已保存
    const STATUS_SAVED = 1;
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
    protected $main_model_alias = 'storage.stockIn';
    // 单据行模型别名 必须
    protected $detail_model_alias = 'storage.stockInDetail';
    // 主表外键字段
    protected $detail_main_foreign = 'stock_in_id';
    // 主表表名
    protected $main_table = 'stock_in';
    // 明细表表名
    protected $detail_table = 'stock_in_detail';

    // 余额方向
    protected $balance_direction = 'in';
    // 包含本次可出库数量
    protected $include_this_time_quantity = true;

    /*
     * 「工作流接口」
     * 保存入库单
     * 将入库单状态设为SAVED
     *
     * @param integer $id => 入库单ID
     * @return boolean
     * */
    public function save_stock_in($id) {
        return $this->update_field_data($id, 'status', self::STATUS_SAVED);
    }

    /*
     * 「工作流接口」
     * 确认入库
     *
     * @param integer $id 单据ID
     * @return array
     * @todo 更新库存，记录库存操作记录
     * */
    public function confirm_stock_in($id, $current_node) {
        if(!I('get.workflow_submit')) {
            return [
                'pause' => 'true',
                'type'=> 'redirect',
                'url' => '/storage/stockIn/confirm/bill/' . $id . '/node/' . $current_node['id']
            ];
        }

        $meta = $this->where(['id'=>$id])->find();

        $detail_service = D('Storage/StockInDetail');
        $stock_service = D('Storage/Stock');
        $log_service = D('Storage/StockLog');

        $this->startTrans();
        $rows = I('post.rows');
        foreach($rows as $k=>$row) {
            if(!$row['id']
                || !$row['this_time_in_quantity']
                || !$row['storage_id']
                || !$row['product_id']
                || !$row['product_unique_id']
            ) {
                continue;
            }
            $detail_service->where(['id'=>$row['id']])->setInc('already_in', $row['this_time_in_quantity']);
            $detail_service->where(['id'=>$row['id']])->save([
                'storage_id' => $row['storage_id']
            ]);
            $rows[$k]['quantity'] = $row['this_time_in_quantity'];
            // 写库存操作记录
            if(false === $log_service->record([
                    'source_model' => 'storage.stockOut',
                    'source_id'    => $id,
                    'bill_no'      => $meta['bill_no'],
                    'direction'    => 'in',
                    'product_id'   => $row['product_id'],
                    'product_unique_id' => $row['product_unique_id'],
                    'quantity'     => $row['this_time_in_quantity'],
                    'storage_id'   => $row['storage_id']
            ])) {
                $this->error = 'storage.Trigger error when record stock log';
                $this->rollback();
                return false;
            }

        }

        // 更新库存清单
        if(false === $stock_service->change_quantity('+', $rows)) {
            $this->error = __('storage.Trigger error when update stock balance');
            $this->rollback();
            return false;
        }

        $this->commit();

        return [
            'type'=> 'redirect',
            'url' => '/storage/stockIn/view/bill/' . $id
        ];
    }

    /*
     * 「工作流接口」
     * 更新状态为部分入库
     * */
    public function update_status_to_part($id) {
        return $this->update_field_data($id, 'status', self::STATUS_PART);
    }

    /*
     * 「工作流接口」
     * 更新状态为已全部入库
     * */
    public function update_status_to_complete($id) {
        return $this->update_field_data($id, 'status', self::STATUS_COMPLETE);
    }

    /*
     * 「工作流接口」
     * 检测是否已完全入库
     * */
    public function check_full_in($id) {
        $rows = D('Storage/StockInDetail')->where(['stock_in_id'=>$id])->select();
        if(!$rows) {
            return false;
        }

        foreach($rows as $row) {
            if($row['quantity'] > $row['already_in']) {
                $this->update_status_to_part($id);
                return false;
            }
        }

        $this->update_status_to_complete($id);
        return true;
    }



}