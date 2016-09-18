<?php

/*
 * @app Sale
 * @package Sale.service.Orders
 * @author laofahai@TEam Swift
 * @link http://ng-erp.com
 * */
namespace Sale\Service;
use Common\Service\CommonBillService;
use Home\Service\AppService;

class OrdersService extends CommonBillService {

    const STATUS_COMPLETE = 2;

    // 单据主表模型别名 必须
    protected $main_model_alias = 'sale.orders';
    // 单据行模型别名 必须
    protected $detail_model_alias = 'sale.ordersDetail';
    // 主表外键字段
    protected $detail_main_foreign = 'orders_id';
    // 主表表名
    protected $main_table = 'orders';
    // 明细表表名
    protected $detail_table = 'orders_detail';

    protected $LOCKED_STATUS = [
        self::STATUS_SAVED
    ];

    // 相关单据模型
    public $related_module = [
        'storage.stockOut',
        'finance.receivables'
    ];

    /*
     * 「工作流接口」
     * 转化为出库单
     * */
    public function convert_to_stock_out($id) {

        if(!AppService::is_app_active('storage')) {
            $this->error = sprintf(__('common.Need %s App Active'), 'storage');
            return false;
        }

        $meta_fields = ['quantity', 'subject', 'bill_no', 'remark'];
        $meta = [];

        $raw_main_data = $this->where(['id'=>$id])->find();

        foreach($raw_main_data as $field=>$value) {
            if(in_array($field, $meta_fields)) {
                $meta[$field] = $value;
            }
        }

        $meta['subject'] = __('sale.Orders stock out') . ' '. $meta['subject'];
        $meta['source_model'] = 'sale.orders';
        $meta['source_id'] = $id;

        $row_model = D('Sale/OrdersDetail');
        $raw_rows_data = $row_model->where([
            'orders_id' => $id
        ])->select();

        $stock_out_service = D('Storage/StockOut');
        $stock_out_id = $stock_out_service->add_bill($meta, $raw_rows_data);
        if(!$stock_out_id) {
            $this->error = $stock_out_service->getError();
            return false;
        }

        return $stock_out_id;
    }


    /*
     * [工作流接口]
     * 生成应收款
     * @todo
     * */
    public function make_receivable($id) {

        $bill_info = $this->where(['id'=>$id])->find();

        $service = D('Finance/Receivables');
        return $service->make_bill([
            'source_model' => 'sale.orders',
            'source_id' => $id,
            'amount'=>$bill_info['net_receive'],
            'customer_id' => $bill_info['customer_id']
        ]);
    }

}