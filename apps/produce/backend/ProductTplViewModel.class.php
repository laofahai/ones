<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of ProductTplViewModel
 *
 * @author nemo
 */
class ProductTplViewModel extends CommonViewModel {
    protected $viewFields = array(
        "ProductTpl" => array("id", "goods_id", "factory_code_all", "memo"),
        "Goods" => array("name"=>"goods_name","factory_code", "measure", "_on"=>"Goods.id=ProductTpl.goods_id"),
    );

    public $searchFields = array(
        "Goods.name", "factory_code", "factory_code_all", "Goods.pinyin"
    );

}
