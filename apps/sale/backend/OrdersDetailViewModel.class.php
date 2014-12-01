<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of OrdersDetailViewModel
 *
 * @author 志鹏
 */
class OrdersDetailViewModel extends CommonViewModel {

    public $foreignKey = "order_id";
    
    protected $viewFields = array(
        "OrdersDetail" => array("*", "_type"=>"left"),
        "Orders" => array("bill_id", "dateline", "_on"=>"Orders.id=OrdersDetail.order_id", "_type"=>"left"),
        "Goods"  => array("name"=>"goods_name", "pinyin"=>"goods_pinyin", "measure","factory_code", "price", "goods_category_id", "_on" => "Goods.id=OrdersDetail.goods_id", "_type"=>"left"),
    );
    
    
}

