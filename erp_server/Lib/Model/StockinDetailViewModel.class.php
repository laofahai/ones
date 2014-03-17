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
        "StockinDetail" => array("id","stockin_id","goods_id","color_id","standard_id","num"),
        "Goods"  => array("name"=>"goods_name", "measure","factory_code", "_on" => "Goods.id=StockinDetail.goods_id"),
        "GoodsColor" => array("name"=>"color_name", "_on"=>"GoodsColor.id=StockinDetail.color_id"),
        "GoodsStandard" => array("name"=>"standard_name", "_on"=>"GoodsStandard.id=StockinDetail.standard_id")
    );
    
}

?>
