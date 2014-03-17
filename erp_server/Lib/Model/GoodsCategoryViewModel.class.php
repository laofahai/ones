<?php

/**
 * @filename GoodsCategoryViewModel.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-11-13  13:10:00
 * @Description
 * 
 */
class GoodsCategoryViewModel extends ViewModel {
    
    protected $viewFields = array(
        "Goods" => array("id","name","price"),
        "GoodsCategory" => array("name"=>"category_name", "_on" => "GoodsCategory.id=Goods.goods_category_id")
    );
    
}

?>
