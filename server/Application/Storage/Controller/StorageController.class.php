<?php

namespace Storage\Controller;
use Common\Controller\BaseRestController;

class StorageController extends BaseRestController {

    protected function _filter(&$map) {}

    public function _before_list_response_($list) {
        /*
         * 总库存金额 = SUM(单位成本*总数量) GROUP BY storage_id
         * */
        $stock_service = D('Storage/Stock');
//        $stock_service->not_belongs_to_company = true;
        $tmp = $stock_service
            ->field('balance, product_company_map_id, avg_purchase_price, storage_id')
            ->where()
            ->select()
        ;

        $price = [];
        $items = [];
        foreach($tmp as $k=>$v) {
            if($v['avg_purchase_price'] > $price[$v['product_company_map_id']]) {
                $price[$v['product_company_map_id']] = $v['avg_purchase_price'];
            }

            if(!array_key_exists($v['storage_id'], $items)) {
                $items[$v['storage_id']] = [];
            }

            if(!array_key_exists($v['product_company_map_id'], $items[$v['storage_id']])) {
                $items[$v['storage_id']][$v['product_company_map_id']] = 0;
            }

            $items[$v['storage_id']][$v['product_company_map_id']] += $v['balance'];
        }

        $total_amount = [];
        foreach($items as $storage_id => $the_items) {
            if(!array_key_exists($storage_id, $total_amount)) {
                $total_amount[$storage_id] = 0;
            }
            foreach($the_items as $pcmi => $num) {
                $total_amount[$storage_id] += ($num*$price[$pcmi]);
            }
        }

        $storage_total_amount = get_array_to_kv($tmp, 'total_amount', 'storage_id');
//        echo $stock_service->getLastSql();
//        print_r($tmp);
//        print_r($storage_total_amount);
//        exit;
        $list = get_array_to_ka($list, "id");
        foreach($list as $k=>$v) {
            $list[$k]['total_storage_amount'] = $total_amount[$v["id"]] ? (float)$total_amount[$v["id"]] : 0;
//            $list[$k]['total_storage_amount'] = $storage_total_amount[$v['id']] ? (float)$storage_total_amount[$v['id']] : 0;
        }

        return $list;
    }

}