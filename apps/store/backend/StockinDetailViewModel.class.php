<?php

/**
 * @filename StockinDetailViewModel.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-11-13  14:35:13
 * @Description
 * 
 */
class StockinDetailViewModel extends CommonViewModel {
    
    protected $viewFields = array(
        "StockinDetail" => array("*", "_type"=>"left"),
        "Goods"  => array("name"=>"goods_name", "pinyin"=>"goods_pinyin", "measure","factory_code", "price", "goods_category_id", "_on" => "Goods.id=StockinDetail.goods_id", "_type"=>"left"),
        "Stock"  => array("name"=>"stock_name", "_on"=>"StockinDetail.stock_id=Stock.id", "_type"=>"left"),
        "StockProductList" => array("num"=>"store_num", "_on"=>"StockinDetail.stock_id=StockProductList.stock_id and StockinDetail.factory_code_all=StockProductList.factory_code_all", "_type"=>"left")
    );
    
}
