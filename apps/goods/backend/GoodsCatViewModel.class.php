<?php

/**
 * @filename GoodsCatViewModel.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-11-21  14:31:24
 * @Description
 * 
 */
class GoodsCatViewModel extends CommonViewModel {

    public $searchFields = array(
        "factory_code", "Goods.name", "GoodsCategory.name", "Goods.pinyin"
    );

    protected $tableName = "Goods";
    protected $viewFields = array(
        "Goods" => array("*","_type"=>"left"),
        "GoodsCategory" => array("name" => "category_name", "_on"=>"GoodsCategory.id=Goods.goods_category_id")
    );

}

