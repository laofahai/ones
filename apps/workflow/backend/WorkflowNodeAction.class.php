<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of WorkflowNodeAction
 *
 * @author 志鹏
 */

class WorkflowNodeAction extends CommonAction {
    
    private $theTypes = array(
        "1" => "人为决策",
        "2" => "自动处理",
        "3" => "等待外部相应",
        "4" => "分支",
        "5" => "汇合",
        "6" => "结束节点",
        "7" => "条件判断"
    );
    
    protected function pretreatment() {
        if(IS_POST and $_POST["pid"]) {
            $_POST["workflow_id"] = $_POST["pid"];
            unset($_POST["pid"]);
        }
        if($_GET["pid"]) {
            $_POST["workflow_id"] = $_GET["pid"];
        }
        
        if(is_array($_POST["prev_node_id"])) {
            $_POST["prev_node_id"] = implode(",", $_POST["prev_node_id"]);
        }
        if(is_array($_POST["next_node_id"])) {
            $_POST["next_node_id"] = implode(",", $_POST["next_node_id"]);
        }

        if($_POST["executor_department"] or $_POST["executor_group"] or $_POST["executor_user"]) {
            $executor = array();
            if($_POST["executor_department"]) {
                $executor["d"] = $_POST["executor_department"];
            }
            if($_POST["executor_group"]) {
                $executor["g"] = $_POST["executor_group"];
            }
            if($_POST["executor_user"]) {
                $executor["u"] = $_POST["executor_user"];
            }

            $tmp = array();
            foreach($executor as $k=>$v) {
                $tmp[] = sprintf("%s:%s", $k, implode(",", $v));
            }
            $_POST["executor"] = implode("|", $tmp);
        }
        
    }
    
    protected function _filter(&$map) {
        if($_GET["workflow_id"]) {
            $map["workflow_id"] = abs(intval($_GET["workflow_id"]));
        }
        if($_GET["pid"]) {
            $map["workflow_id"] = abs(intval($_GET["pid"]));
        }
        if($_GET["workflow_alias"]) {
            $model = D("Workflow");
            $workflow = $model->getByAlias($_GET["workflow_alias"]);
            $map["workflow_id"] = $workflow["id"];
        }
        if($_GET["only_active"]) {
            $map["type"] = array("NOT IN", "2,3");
        }
        
        //通过某NODE获取工作流所有节点
        if($_GET["by_node_id"]) {
            $tmp = D("WorkflowNode")->find($_GET["by_node_id"]);
            $map["workflow_id"] = $tmp["workflow_id"];
        }
    }
    
    protected function _order(&$order) {
        $order="listorder ASC, id ASC";
    }
    
    public function index() {
        //获取所有节点
        if(!$_GET["mainrow_id"]) {
            return parent::index();
        }

        //仅获取当前数据的下一ID
        
//        $map = array();
//        $this->_filter($map);
        
        import("@.Workflow.Workflow");
        $workflow = new Workflow($_GET["workflow_alias"]);
        $process = $workflow->getCurrentProcess($_GET["mainrow_id"]);
        $this->response(reIndex($process["nextNode"]));
        
    }
    
    public function read() {
        $data = parent::read(true);
        $data["prev_node_id"] = explode(",", $data["prev_node_id"]);
        $data["next_node_id"] = explode(",", $data["next_node_id"]);
        $executors = explode("|", $data["executor"]);

        foreach($executors as $exe) {
            $tmp = explode(":", $exe);
            switch($tmp[0]) {
                case "g":
                    $data["executor_group"] = explode(",", $tmp[1]);
                    break;
                case "d":
                    $data["executor_department"] = explode(",", $tmp[1]);
                    break;
                case "u":
                    $data["executor_user"] = explode(",", $tmp[1]);
            }
        }


        $this->response($data);
    }
    
//    public function index() {
//        $workflow_id = abs(intval($_GET["workflow_id"]));
//        if(!$workflow_id) {
//            $this->redirect("/HOME/Workflow");
//        }
//        $workflow = D("Workflow");
//        $theWorkflow = $workflow->find($workflow_id);
//        if(!$theWorkflow) {
//            $this->redirect("/HOME/Workflow");
//        }
//        $this->assign("theWorkflow", $theWorkflow);
//        $_REQUEST["order"] = "listorder";
//        $_REQUEST["sort"] = "ASC";
//        parent::index();
//    }
//    
//    public function _before_edit() {
//        $this->assign("theTypes", $this->theTypes);
//    }
//    
//    public function add() {
//        $this->assign("theTypes", $this->theTypes);
//        $workflow_id = abs(intval($_GET["workflow_id"]));
//        if(!$workflow_id) {
//            $this->redirect("/HOME/Workflow");
//        }
//        $workflow = D("Workflow");
//        $theWorkflow = $workflow->find($workflow_id);
//        $this->assign("theWorkflow", $theWorkflow);
//        
//        parent::add();
//    }
//    
//    public function setPermission() {
//        $id = abs(intval($_GET["id"]));
//        $nodeModel = D("WorkflowNode");
//        $theNode = $nodeModel->find($id);
//        
//        if(IS_POST){
//            foreach($_POST as $k=>$v) {
//                $rules[] = sprintf("%s:%s", $k, implode(",", $v));
//            }
//            $nodeModel->where("id=".$id)->save(array(
//                "executor" => implode("|", $rules)
//            ));
//            
//            $this->redirect("/HOME/WorkflowNode/index/workflow_id/".$theNode["workflow_id"]);
//            return;
//        }
//        
//        /** 用户组 */
//        $tmp = D("AuthGroup")->select();
//        foreach($tmp as $k=>$t) {
//            $theGroups[$t["id"]] = $t["title"];
//        }
//        /** 部门 */
//        $tmp = D("Department")->getTree();
//        foreach($tmp as $k=>$t) {
//            $theDepts[$t["id"]] = $t["prefix"].$t["name"];
//        }
//        /** 用户 */
//        $tmp = D("User")->select();
//        foreach($tmp as $k=>$t) {
//            $theUsers[$t["id"]] = $t["truename"];
//        }
//        
//        $rules = explode("|", $theNode["executor"]);
//        
//        foreach($rules as $item) {
//            list($k, $rule) = explode(":", $item);
//            $rule = explode(",", $rule);
//            switch($k) {
//                case "g":
//                    $selectedGroups = $rule;
//                    break;
//                case "d":
//                    $selectedDepts = $rule;
//                    break;
//                case "u":
//                    $selectedUsers = $rule;
//                    break;
//            }
//        }
//        
//        $this->assign("theNode", $theNode);
//        $this->assign("theGroups", $theGroups);
//        $this->assign("theDepts", $theDepts);
//        $this->assign("theUsers", $theUsers);
//        
//        $this->assign("selectedGroups", $selectedGroups);
//        $this->assign("selectedDepts", $selectedDepts);
//        $this->assign("selectedUsers", $selectedUsers);
//        
//        $this->display();
//        
//    }
    
}
