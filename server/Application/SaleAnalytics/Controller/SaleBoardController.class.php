<?php

/*
 * @app SaleAnalytics
 * @package SaleAnalytics.controller.SaleBoard
 * @author laofahai@TEam Swift
 * @link http://ng-erp.com
 * */
namespace SaleAnalytics\Controller;
use Common\Controller\BaseRestController;
use Sale\Service\OrdersService;

class SaleBoardController extends BaseRestController {

    protected function _filter(&$map) {}

    // 销售排行
    public function _EM_get_data() {

        // 查询时间段，默认为本月
        if(I('get.st') && I('get.et')) {
            $start_time = date('Y-m-d 00:00:00', strtotime(I('get.st')));
            $end_time = date("Y-m-d 23:59:59", strtotime(I('get.et')));
        } else {
            $start_time = date('Y-m-01', CTS);
            $end_time = date("Y-m-d 23:59:59", strtotime("$start_time +1 month -1 day"));
        }

        // 排行榜数量
        $limit = I('get.limit') ? I('get.limit') : 10;
        // 排序按照
        if(I('get.sort_by') == 'amount') {
            $list_order = 'total_amount DESC, total_quantity DESC';
        } else {
            $list_order = 'total_quantity DESC, total_amount DESC';
        }

        $order_service = D('Sale/Orders');
        $detail_service = D('Sale/OrdersDetail');
        $product_service = D('Product/Product', 'Model');

        $map = [
            'created' => ['BETWEEN', [$start_time, $end_time]],
            'status' => OrdersService::STATUS_COMPLETE
        ];

        $orders_in_range = $order_service->where($map)->select();
        $orders_in_range = get_array_by_field($orders_in_range, "id");

        // 所有已完成销售详情
        $all_details = $detail_service->field(
            'SUM(subtotal_amount) AS total_amount, SUM(quantity) AS total_quantity, product_unique_id, product_id'
        )->group('`product_unique_id`')->where([
            'orders_id' => ['IN', $orders_in_range]
        ])->limit($limit)->order($list_order)->select();

        $product_ids = get_array_by_field($all_details, 'product_id');
        $products = $product_service->where(['Product.id'=>['IN', $product_ids]])->select();
        $products = get_array_to_ka($products, 'id');

        $response_data = [
            'subtext' => sprintf('%s ~ %s', $start_time, $end_time),
            // 数据
            'data' => [
                'amount' => [],
                'quantity' => []
            ],
            // X轴标签
            'xAxis' => [],
        ];

        foreach($all_details as $detail) {
            array_push($response_data['xAxis'], $products[$detail['product_id']]['name']);
            array_push($response_data['data']['amount'],
                $detail['total_amount'] ? (float)$detail['total_amount'] : 0
            );
            array_push($response_data['data']['quantity'],
                $detail['total_quantity'] ? (float)$detail['total_quantity'] : 0
            );
        }

        $this->response($response_data);
    }

}