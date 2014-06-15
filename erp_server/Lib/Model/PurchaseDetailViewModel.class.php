<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of PurchaseDetailViewModel
 *
 * @author 志鹏
 */
class PurchaseDetailViewModel extends CommonViewModel {
    
    protected $viewFields = array(
        "PurchaseDetail" => array("id","purchase_id","goods_id","color_id","standard_id","num","price","per_price"),
        "Purchase" => array("bill_code","subject","stock_id","_on"=>"Purchase.id=PurchaseDetail.purchase_id"),
        "Goods" => array("name" => "goods_name", "measure", "factory_code", "price"=>"old_per_price", "_on"=>"Goods.id=PurchaseDetail.goods_id"),
        "GoodsColor" => array("name" => "color_name", "_on"=>"GoodsColor.id=PurchaseDetail.color_id"),
        "GoodsStandard" => array("name" => "standard_name", "_on"=>"GoodsStandard.id=PurchaseDetail.standard_id"),
        "StockProductList" => array("num"=>"store_num", "id"=>"stock_product_id", "_on"=>"StockProductList.factory_code_all=PurchaseDetail.factory_code_all")
    );
    
    
}

?>
