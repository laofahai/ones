<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of ProductTplDetailViewModel
 *
 * @author nemo
 */
class ProductTplDetailViewModel extends CommonViewModel {
//    protected $tableName = "product_tpl_detail";
    protected $viewFields = array(
        "ProductTplDetail" => array("*", "_type"=>"left"),
        "Goods" => array("name"=>"goods_id_label", "_on"=>"Goods.id=ProductTplDetail.goods_id", "_type"=>"left"),
//        "Stock" => array("name"=>"stock_label", "_on"=>"Stock.id=ProductTplDetail.stock_id")
    );
}
