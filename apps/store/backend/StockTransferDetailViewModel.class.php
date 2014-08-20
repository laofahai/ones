<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of StockTransferDetailViewModel
 *
 * @author 志鹏
 */
class StockTransferDetailViewModel extends CommonViewModel {
    
    protected $viewFields = array(
        "StockTransferDetail" => array("id","stock_transfer_id","goods_id","color_id","standard_id","num"),
        "StockTransfer" => array("subject","instock_id","outstock_id", "_on"=>"StockTransfer.id=StockTransferDetail.stock_transfer_id"),
        "Goods" => array("name" => "goods_name", "measure", "factory_code", "price"=>"old_per_price", "_on"=>"Goods.id=StockTransferDetail.goods_id"),
        "GoodsColor" => array("name" => "color_name", "_on"=>"GoodsColor.id=StockTransferDetail.color_id"),
        "GoodsStandard" => array("name" => "standard_name", "_on"=>"GoodsStandard.id=StockTransferDetail.standard_id"),
        "StockProductList" => array("num"=>"store_num", "id"=>"stock_product_id", "_on"=>"StockProductList.factory_code_all=StockTransferDetail.factory_code_all")
    );
    
    
}

?>
