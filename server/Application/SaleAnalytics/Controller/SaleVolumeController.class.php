<?php

/*
 * @app SaleAnalytics
 * @package SaleAnalytics.controller.SaleVolume
 * @author laofahai@TEam Swift
 * @link http://ng-erp.com
 * */
namespace SaleAnalytics\Controller;
use Common\Controller\BaseRestController;
use Sale\Service\OrdersService;
use Analytics\Service;

class SaleVolumeController extends BaseRestController {

    protected function _filter(&$map) {}

    /*
     * 根据日期查询
     * */
    public function _EM_get_data_by_date() {
        // 支持年，月，日三中纬度，默认为当月
        $start_time = null;
        $end_time = null;
        $date_prefix = '';

        $start_timestamp = null;
        $end_timestamp = null;

        if(I('get.st') && I('get.et')) {
            $start_timestamp = strtotime(I('get.st'));
            $end_timestamp = strtotime(I('get.et'));
            $start_time = date('Y-m-d', $start_timestamp);
            $end_time = date('Y-m-d', $end_timestamp);

            switch(I('get.dimension')) {
                case "year":
                    $date_item = 'Y';

                    $range_start = date('Y', $start_timestamp);
                    $range_end = date('Y', $end_timestamp);
                    break;
                case "month":
                    $date_item = 'm';

//                    $date_prefix = date('Y-', CTS);
                    $range_start = date('m', $start_timestamp);
                    $range_end = date('m', $end_timestamp);
                    break;
                default:
                    $date_item = 'd';

//                    $date_prefix = date('m-', CTS);
                    $range_start = date('d', $start_timestamp);
                    $range_end = date('d', $end_timestamp);
                    break;
            }

        } else {
            switch(I('get.dimension')) {
                case "year":
                    $date_item = 'Y';
                    $start_time = date('Y-01-01 00:00:00', strtotime(date('Y-m-d H:i:s', CTS) . ' -6 year'));
                    $end_time = date("Y-12-31 23:59:59", CTS);

                    $range_start = date('Y', strtotime($start_time));
                    $range_end = date('Y', CTS);
                    break;
                case "month":
                    $date_item = 'm';
                    $start_time = date('Y-01-01 00:00:00', CTS);
                    $end_time = date("Y-12-31 23:59:59", CTS);

                    $date_prefix = date('Y-', CTS);
                    $range_start = 1;
                    $range_end = 12;
                    break;
                default:
                    $date_item = 'd';
                    $start_time = date('Y-m-01 00:00:00', CTS);
                    $end_time = date("Y-m-d 23:59:59", strtotime("$start_time +1 month -1 day"));

                    $date_prefix = date('m-', CTS);
                    $range_start = 1;
                    $range_end = date($date_item, strtotime($end_time));
                    break;
            }
        }


        // 时间序列数组
        $date_range = range($range_start, $range_end);

        $map = [
            'created' => ['BETWEEN', [$start_time, $end_time]],
            'status'  => OrdersService::STATUS_COMPLETE
        ];

        // 按部门查看
        if(I('get.dept')) {
            $users = D('Account/Department')->get_department_users(I('get.dept'));
            $user_ids = get_array_by_field($users, 'id');
            $map['user_info_id'] = ['IN', (array)$user_ids];
        }

        $orders_tmp = D('Sale/Orders')->where($map)->select();
        $orders_cleaned = [];
        foreach($orders_tmp as $order) {
            $key = 'date_' . date($date_item, strtotime($order['created']));
            if(!$orders_cleaned[$key]) {
                $orders_cleaned[$key] = [
                    'amount' => $order['net_receive'],
                    'quantity' => $order['quantity']
                ];
                continue;
            }

            $orders_cleaned[$key]['amount'] += $order['net_receive'];
            $orders_cleaned[$key]['quantity'] += $order['quantity'];
        }


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

        foreach($date_range as $date) {
            $date = $date < 10 ? '0'.$date : $date;
            $key = 'date_' . $date;
            array_push($response_data['xAxis'], $date_prefix . $date);
            array_push($response_data['data']['amount'],
                $orders_cleaned[$key]['amount'] ? (float)$orders_cleaned[$key]['amount'] : 0
            );
            array_push($response_data['data']['quantity'],
                $orders_cleaned[$key]['quantity'] ? (float)$orders_cleaned[$key]['quantity'] : 0
            );
        }


        $this->response($response_data);
    }

}