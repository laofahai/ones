<?php

/**
 * @filename StockoutOrdersDetailViewModel.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-11-19  10:56:01
 * @Description
 * 
 */
class StockoutOrdersDetailViewModel extends CommonViewModel {
    
    protected $viewFields = array(
        "StockoutDetail" => array("stockout_id"),
        "OrdersDetail" => array("order_id","goods_id","color_id","standard_id","num","price","per_price","factory_code_all","_on"=>"OrdersDetail.id=StockoutDetail.source_row_id"),
        "Goods" => array("name" => "goods_name", "factory_code","measure", "price"=>"old_per_price", "_on"=>"Goods.id=OrdersDetail.goods_id"),
        "GoodsColor" => array("name" => "color_name", "_on"=>"GoodsColor.id=OrdersDetail.color_id"),
        "GoodsStandard" => array("name" => "standard_name", "_on"=>"GoodsStandard.id=OrdersDetail.standard_id"),
        "StockProductList" => array("num"=>"store_num", "id"=>"stock_product_id", "_on"=>"StockProductList.factory_code_all=OrdersDetail.factory_code_all")
    );
    
}

?>
