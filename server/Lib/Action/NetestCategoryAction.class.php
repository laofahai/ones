<?php

/**
 * @filename NetestCategoryAction.class.php 
 * @encoding UTF-8 
 * @author 闫志鹏 <a href="mailto:dk_nemo@163.com">dk_nemo@163.com</a>
 *
 *
 * @datetime 2013-11-18  13:25:14
 * @Description
 * 
 */
class NetestCategoryAction extends CommonAction {
    
    public function index($return=false, $parentid=1) {

        $this->_external_action();
        if($this->breakAction) {
            return;
        }

        $name = $this->indexModel ? $this->indexModel : $this->getActionName();
//        echo $name;exit;
        $categoryModel = D($name);
        $tree = $categoryModel->getTree($parentid);
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
