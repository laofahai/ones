<?php

/**
 * @filename StockoutStockTransferDetailViewModel.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-11-19  10:56:01
 * @Description
 * 
 */
class StockoutStockTransferDetailViewModel extends CommonViewModel {
    
    protected $viewFields = array(
        "StockoutDetail" => array("stockout_id"),
        "StockTransferDetail" => array("stock_transfer_id","goods_id","color_id","standard_id","num","factory_code_all","_on"=>"StockTransferDetail.id=StockoutDetail.source_row_id"),
        "Goods" => array("name" => "goods_name", "factory_code","measure", "price"=>"old_per_price", "_on"=>"Goods.id=StockTransferDetail.goods_id"),
        "GoodsColor" => array("name" => "color_name", "_on"=>"GoodsColor.id=StockTransferDetail.color_id"),
        "GoodsStandard" => array("name" => "standard_name", "_on"=>"GoodsStandard.id=StockTransferDetail.standard_id"),
        "StockProductList" => array("num"=>"store_num", "id"=>"stock_product_id", "_on"=>"StockProductList.factory_code_all=StockTransferDetail.factory_code_all")
    );
    
}

?>
