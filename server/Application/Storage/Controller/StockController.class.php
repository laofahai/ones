<?php

namespace Storage\Controller;
use Common\Controller\BaseRestController;

class StockController extends BaseRestController {

    protected function _filter(&$map) {}

    /*
     * @override
     * 为库存清单附加总库存
     * */
    public function on_list() {
        $data = parent::on_list(true);
        $list = $data[1];

        $product_ids = get_array_by_field($list, 'product_id');
        $map = [
            'product_id' => ['IN', $product_ids]
        ];

        $total_balance = D('Storage/Stock')
            ->field('SUM(balance) as total_balance, product_id, product_unique_id')
            ->where($map)
            ->group('product_unique_id')->select();
        $total_balance = get_array_to_ka($total_balance, 'product_unique_id');

        foreach($list as $k=>$v) {
            if(array_key_exists($v['product_unique_id'], $total_balance)) {
                $list[$k]['total_balance'] = $total_balance[$v['product_unique_id']]['total_balance'];
            }
        }

        $data[1] = reIndex($list);
        $this->response($data, 'stock', true);
    }

}