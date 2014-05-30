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
        "StockinDetail" => array("id","stockin_id","goods_id","stock_id","num", "factory_code_all", "memo"),
        "Goods"  => array("name"=>"goods_name", "pinyin"=>"goods_pinyin", "measure","factory_code", "price", "goods_category_id", "_on" => "Goods.id=StockinDetail.goods_id"),
        "Stock"  => array("name"=>"stock_name")
    );
    
}

?>
