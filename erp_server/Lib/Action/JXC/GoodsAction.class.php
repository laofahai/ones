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
    
    public function index() {
        
        $goodsModel = D("GoodsCatView");
        
        $count = $goodsModel->count();
        list($limit, $totalPage) = $this->getQueryLimit($count, $_GET["page"] ? abs(intval($_GET["page"])) : 1, 25);
        $theGoods = $goodsModel->select();
        $this->response($theGoods);
    }
    
//    public function index() {
//        //列表过滤器，生成查询Map对象
//        $map = $this->_search();
//        if (method_exists($this, '_filter')) {
//            $this->_filter($map);
//        }
//        $model = D("GoodsCatView");
//        if (!empty($model)) {
//            $this->_list($model, $map);
//        }
//        cookie('_currentUrl_', __SELF__);
//        $this->display();
//    }
    
    private function _assign_categories() {
        $cat = D("GoodsCategory");
        $data = $cat->getTree(1);
        foreach($data as $k=>$t) {
            $data[$k]["prefix_name"] = $t["prefix"].$t["name"];
        }
        $data = $cat->getIndexArray($data, "prefix_name");
        $this->assign("theCategories", $data);
    }
    
    
    public function _before_add() {
        $this->_assign_categories();
    }
    
    public function _before_edit() {
        $this->_assign_categories();
    }
    
}

?>
