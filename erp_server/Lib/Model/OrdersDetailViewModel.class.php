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
    
    protected $viewFields = array(
        "OrdersDetail" => array("id","order_id","goods_id","color_id","standard_id","num","price","per_price"),
        "Orders" => array("bill_code","subject","stock_id","_on"=>"Orders.id=OrdersDetail.order_id"),
        "Goods" => array("name" => "goods_name", "measure", "factory_code", "price"=>"old_per_price", "_on"=>"Goods.id=OrdersDetail.goods_id"),
        "GoodsColor" => array("name" => "color_name", "_on"=>"GoodsColor.id=OrdersDetail.color_id"),
        "GoodsStandard" => array("name" => "standard_name", "_on"=>"GoodsStandard.id=OrdersDetail.standard_id"),
        "StockProductList" => array("num"=>"store_num", "id"=>"stock_product_id", "_on"=>"StockProductList.factory_code_all=OrdersDetail.factory_code_all")
    );
    
    
}

?>
