<?php

/**
 * @filename WorkflowAbstract.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-11-15  10:09:20
 * @Description
 * 
 */
abstract class WorkflowAbstract implements WorkflowInterface{
    
    protected $mainrowId;
    
    protected $view;
    
    public $context = array();
    
    public $currentNode;
    
    public function __construct($mainrowId) {
        $this->mainrowId = $mainrowId;
        $this->view = Think::instance('View');
    }
    
    public function init() {}
    
    public function run() {}
    
    public function save() {}
    
    protected function updateStatus($model, $mainrow_id, $status) {
        $model = D($model);
        $data = array(
            "id" => $mainrow_id,
            "status" => $status
        );
        return $model->save($data);
    }
    
    protected function getNodeByAlias($model, $alias) {
        $workflowModel = D("Workflow");
        $workflow = $workflowModel->where("workflow_file='".$model."'")->find();
        $map = array(
            "workflow_id" => $workflow["id"],
            "execute_file"=> $alias
        );
        $nodeModel = D("WorkflowNode");
        $rs = $nodeModel->where($map)->find();
//        echo $nodeModel->getLastSql();
//        var_dump($rs);
        return $rs;
    }
    
    protected function updateMemo($alias, $mainrowId, $nodeid, $memo) {
        $workflow = D("Workflow")->getByAlias($alias);
        $map = array(
            "workflow_id" => $workflow["id"],
            "mainrow_id"  => $mainrowId,
            "node_id"     => $nodeid,
            "status"      => 0,
        );
        $model = D("WorkflowProcess");
//        exit;
        $rs = $model->where($map)->save(array("memo" => $memo));
//        echo $model->getLastSql();exit;
        return $rs;
    }
    
    protected function displayLeaveMemo() {
        import("@.Form.Form");
        $form = new Form("WorkflowMemo");
        $this->view->assign("FormHTML", $form->makeForm(""));
        $this->view->assign("lang_title", "leave_memo");
        $this->view->display("../Common/Workflow/leaveMemo");
        
        return "wait";
    }
    
    public function checkPermission($condition) {
        if(!$condition) {
            return true;
        }
        $condition = explode("&", $condition);
        foreach($condition as $tmp) {
            list($var, $cond) = explode("=", $tmp);
            switch($var) {
                case "method":
                    if(method_exists($this, $cond)) {
                        return $this->$cond();
                    }
                    break;
                case "function":
                    if(function_exists($cond)) {
                        return $cond();
                    }
                    break;
                case "uid":
                    list($checkType, $uids) = explode("|", $uids);
                    switch($checkType) {
                        case "IN":
                            return inExplodeArray(getCurrentUid(), $uids);
                            break;
                        default:
                            return getCurrentUid() == $uids;
                    }
                    break;
            }
        }
    }
    
}

?>
