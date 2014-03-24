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
    protected $tableName = "Goods";
    protected $viewFields = array(
        "Goods" => array("id","goods_category_id","name","pinyin","price","measure","factory_code","store_min","store_max"),
        "GoodsCategory" => array("name" => "category_name", "_on"=>"GoodsCategory.id=Goods.goods_category_id")
    );
}

?>
