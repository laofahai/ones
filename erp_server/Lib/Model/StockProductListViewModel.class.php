<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of StockProductListViewModel
 *
 * @author 志鹏
 */
class StockProductListViewModel extends ViewModel {
    
    protected $viewFields = array(
        "StockProductList" => array("id","factory_code_all","goods_id","stock_id","color_id","standard_id","num"),
        "Goods" => array("name"=>"goods_name","measure","store_min", "_on"=>"Goods.id=StockProductList.goods_id"),
        "Stock" => array("name"=>"stock_name", "total_num"=>"stock_total_num", "_on"=>"Stock.id=StockProductList.stock_id"),
        "GoodsColor" => array("name"=>"color_name", "_on"=>"GoodsColor.id=StockProductList.color_id"),
        "GoodsStandard" => array("name"=>"standard_name", "_on"=>"GoodsStandard.id=StockProductList.standard_id")
    );
    
}

?>
