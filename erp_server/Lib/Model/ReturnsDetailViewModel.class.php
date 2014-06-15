<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of ReturnsDetailViewModel
 *
 * @author 志鹏
 */
class ReturnsDetailViewModel extends CommonViewModel {
    
    protected $viewFields = array(
        "ReturnsDetail" => array("id","returns_id","goods_id","color_id","standard_id","num"),
        "Returns" => array("bill_code","subject","stock_id","_on"=>"Returns.id=ReturnsDetail.returns_id"),
        "Goods" => array("name" => "goods_name", "measure", "factory_code", "price"=>"old_per_price", "_on"=>"Goods.id=ReturnsDetail.goods_id"),
        "GoodsColor" => array("name" => "color_name", "_on"=>"GoodsColor.id=ReturnsDetail.color_id"),
        "GoodsStandard" => array("name" => "standard_name", "_on"=>"GoodsStandard.id=ReturnsDetail.standard_id")
    );
    
    
}

?>
