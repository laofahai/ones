<?php

namespace Storage\Controller;
use Common\Controller\BaseRestController;
use Home\Service\AppService;

class StockController extends BaseRestController {

    protected function _filter(&$map) {}

    /*
     * @override
     * 为库存清单附加总库存及总库存金额
     * */
    public function on_list() {
        $data = parent::on_list(true);
        $list = $data[1];

        $product_ids = get_array_by_field($list, 'product_id');
        $map = [
            'product_id' => ['IN', $product_ids]
        ];

        $stock_service = D('Storage/Stock');

        $total_balance = $stock_service
            ->field('SUM(balance) as total_balance, product_id, product_company_map_id')
            ->where($map)
            ->group('product_company_map_id')->select();
        $total_balance = get_array_to_ka($total_balance, 'product_company_map_id');

        foreach($list as $k=>$v) {
            if(array_key_exists($v['product_company_map_id'], $total_balance)) {
                $list[$k]['total_balance'] = $total_balance[$v['product_company_map_id']]['total_balance'];
            }
        }

        // 产品属性
        if(AppService::is_app_active('productAttribute')) {
            $list = D('ProductAttribute/ProductAttribute')->assign_to($list);
        }

        $data[1] = reIndex($list);
        $this->response($data, 'stock', true);
    }

}