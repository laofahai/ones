<?php

/**
 * @filename NetestCategoryAction.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-11-18  13:25:14
 * @Description
 * 
 */
class NetestCategoryAction extends CommonAction {
    
    public function index($return=false) {

        $this->_external_action();
        if($this->breakAction) {
            return;
        }

        $name = $this->indexModel ? $this->indexModel : $this->getActionName();
//        echo $name;exit;
        $categoryModel = D($name);
        $tree = $categoryModel->getTree(1);
//        echo $categoryModel->getLastSql();exit;
        foreach($tree as $k=>$t) {
            $tree[$k]["prefix_name"] = $t["prefix"].$t["name"];
        }

        if($return) {
            return $tree;
        }

        $this->response($tree);
    }
    
    
    public function insert() {
        $catModel = D(MODULE_NAME);
        $rs = $catModel->addChildNode($_POST);
        if(!$rs) {
            Log::write("Add NetestCategory failed: ". $_POST["pid"]);
            $this->error($catModel->getError());
        }
    }
    
    public function delete() {
        $catModel = D(MODULE_NAME);
        if($catModel->deleteNode($_GET["id"])) {
            $this->success("operate_success");
        } else {
            $this->error($catModel->getError());
        }
    }
    
}
