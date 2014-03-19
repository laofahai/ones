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
    
    public function index() {
        $categoryModel = D(MODULE_NAME);
        $tree = $categoryModel->getTree(1);
        foreach($tree as $k=>$t) {
            $tree[$k]["prefix_name"] = $t["prefix"].$t["name"];
        }
        
        $this->response($tree);
    }
    
    public function _before_add() {
        $pid = abs(intval($_GET["parentId"]));
        if($pid) {
            $model = D(MODULE_NAME);
            $this->assign("parent", $model->find($pid));
        }
    }
    
    public function insert() {
        $catModel = D(MODULE_NAME);
        $rs = $catModel->addChildNode($_POST);
        if($rs) {
            $this->success('添加成功', U('/'.GROUP_NAME.'/'.MODULE_NAME));
        } else {
            $this->error('添加失败', U('/'.GROUP_NAME.'/'.MODULE_NAME));
        }
    }
    
    public function foreverdelete() {
        $catModel = D(MODULE_NAME);
        if($catModel->deleteNode($_GET["id"])) {
            $this->success("operate_success");
        } else {
            $this->error("operate_failed");
        }
    }
    
}

?>
