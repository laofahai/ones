<?php

namespace Storage\Event;
use Common\Event\BaseRestEvent;

class StockEvent extends BaseRestEvent {

    /*
     * 查询库存余量
     * */
    public function get_quantity_balance() {
        $service = D('Storage/Stock');
        $quantity_balance = $service->get_quantity_by_product(I('get.'));
        $this->response(['quantity_balance'=>$quantity_balance]);
    }

}