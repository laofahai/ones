<?php

/**
 * @filename GoodsCategoryAction.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-11-12  17:22:38
 * @Description
 * 
 */
class GoodsCategoryAction extends NetestCategoryAction {

    protected function pretreatment() {
        switch($this->_method) {
            case "post":
            case "put":
                $_POST["pinyin"] = $_POST["pinyin"] ? $_POST["pinyin"] : Pinyin($_POST["name"]);
                break;
        }
    }
    
}
