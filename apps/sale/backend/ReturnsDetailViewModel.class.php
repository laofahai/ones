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
        "ReturnsDetail" => array("*", "_type"=>"left"),
        "Goods"  => array("name"=>"goods_name", "pinyin"=>"goods_pinyin", "measure","factory_code", "price", "goods_category_id", "_on" => "Goods.id=ReturnsDetail.goods_id", "_type"=>"left"),
    );

    
}

?>
