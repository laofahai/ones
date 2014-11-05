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

    public $readModel = "GoodsCatView";

    protected $dataModelAlias = "goodsBaseInfo";
    
    protected function _filter(&$map) {
//        $typeahead = strtoupper(trim(strip_tags($_GET["typeahead"])));
//        if($typeahead) {
//            $where["name"] = array("LIKE", "%{$typeahead}%");
//            $where["factory_code"] = array("LIKE", "{$typeahead}%");
//            $where["pinyin"] = array("LIKE", "%{$typeahead}%");
//            $where["_logic"] = "OR";
//            $map["_complex"] = $where;
//            $map["deleted"] = 0;
//        }

        if($_GET["factory_code"]) {
            $map["factory_code"] = trim($_GET["factory_code"]);
            $map["deleted"] = array("EGT", 0);
        }
    }


    public function index() {
        if(!$_GET["typeahead"]) {
            return parent::index();
        }

        $model = D("Goods");
        $map = $this->beforeFilter($model);
        $this->_filter($map);
        $data = $model->where($map)->limit(10)->order("LENGTH(pinyin) ASC")->select();
        foreach($data as $k=>$v) {
            $data[$k]["combineId"] = sprintf("%s_%d_%d", $v["factory_code"], $v["id"], $v["goods_category_id"]);
            $data[$k]["combineLabel"] = sprintf("%s", $v["name"]);
        }

//        echo count($data);exit;
        $this->response($data);
    }
    
    protected function pretreatment() {
        
        switch($this->_method) {
            case "post":
            case "put":
                if(!$_POST["pinyin"]) {
                    $_POST["pinyin"] = Pinyin($_POST["name"]);
                }
                break;
        }
    }
    
}
