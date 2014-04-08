<?php

/**
 * @filename GoodsAction.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-11-12  17:22:00
 * @Description
 * 
 */
class GoodsAction extends CommonAction {
    
    public $indexModel = "GoodsCatView";
    
    protected function _filter(&$map) {
        $typeahead = strtoupper(trim(strip_tags($_GET["typeahead"])));
        if($typeahead) {
            $map["name"] = array("LIKE", "%{$typeahead}%");
            $map["factory_code"] = array("LIKE", "{$typeahead}%");
            $map["pinyin"] = array("LIKE", "%{$typeahead}%");
            $map["_logic"] = "OR";
        }
    }
    
    protected function _before_index() {
        $this->indexModel = "Goods";
    }
    
    public function index() {
        $model = D("Goods");
        $data = $model->select();
        foreach($data as $k=>$v) {
            $data[$k]["combineId"] = sprintf("%s_%d_%d", $v["factory_code"], $v["id"], $v["goods_category_id"]);
            $data[$k]["combineLabel"] = sprintf("%s_%s", $v["name"], $v["pinyin"]);
        }
        
        $this->response($data);
    }
    
    protected function pretreatment() {
        switch($this->_method) {
            case "post":
            case "put":
                $_POST["pinyin"] = Pinyin($_POST["name"]);
                break;
        }
    }
    
}

?>
