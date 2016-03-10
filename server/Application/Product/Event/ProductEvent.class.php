<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 5/19/15
 * Time: 20:54
 */

namespace Product\Event;
use Common\Event\BaseRestEvent;


class ProductEvent extends BaseRestEvent {

    public function _EM_fetch_product_unit_price() {
        $product = D('Product/Product')->where(['id'=>I('get.product_id')])->find();

        $this->response([
            'sale_price' => (float)$product['price'],
            'purchase_price' => (float)$product['cost']
        ]);
    }

}