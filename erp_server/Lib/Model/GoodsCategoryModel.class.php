<?php

/**
 * @filename GoodsCategoryModel.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-11-12  17:15:48
 * @Description
 * 
 */

class GoodsCategoryModel extends CommonTreeModel {
    
    public function __construct($modelName="", $tablePrefix="", $connection="") {
        parent::__construct("GoodsCategory", $tablePrefix, $connection);
    }
 
    
}
?>
