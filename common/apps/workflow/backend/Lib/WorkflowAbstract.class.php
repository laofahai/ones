<?php

/**
 * @filename WorkflowAbstract.class.php 
 * @encoding UTF-8 
 * @author 闫志鹏 <a href="mailto:dk_nemo@163.com">dk_nemo@163.com</a>
 *
 *
 * @datetime 2013-11-15  10:09:20
 * @Description
 * 
 */
abstract class WorkflowAbstract implements WorkflowInterface {
    
    protected $mainrowId;
    
    protected $view;
    
    public $context = array();
    
    public $currentNode;
    
    public function __construct($mainrowId) {
        $this->mainrowId = $mainrowId;
        $this->view = Think::instance('View');
    }
    
    public function init() {}
    
    /**
     * @return mixed 
     *   boolean true : doNext()
     *   mixed any empty thing : doNext();
     *   mixed any thing == true : pause
     */
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
    
    //AJAX返回JSON数据，如流程节点中断等
    public function response($data) {
        echo json_encode($data);exit;
    }
    
    public function error($msg) {
        $this->response(array(
            "error" => 1,
            "msg"   => $msg
        ));
    }
    public function success($msg) {
        $this->response(array(
            "error" => 0,
            "msg"   => $msg
        ));
    }

    //弹出一个备注框
    public function leaveMessage() {
        $this->response(array(
            "type" => "leave_message"
        ));
    }

    /*
     * 节点扩展权限检测
     * @param array $condition
     * $condition = array(
     *  method  => someMethodCheck, //$someNodeObj->someMethodCheck
     *  function=> someFunction // someFunction(),
     *  uid => array() or id
     * );
     * 可在节点处理类中灵活实现对当前数据进程的权限判断
     * 场景eg: 销售订单5000元以上需要某高级人员权限审核
     * **/
    final public function checkCondition($condStr) {
        if(!$condStr) {
            return true;
        }

        $condition = explode("|", $condStr);

        foreach($condition as $tmp) {
            list($type, $cond) = explode(":", $tmp);
            switch($type) {
                //method
                case "m":
                    if(method_exists($this, $cond)) {
                        return $this->$cond();
                    }
                    break;
                //function
                case "f":
                    if(function_exists($cond)) {
                        return $cond($this->mainrowId);
                    }
                    break;
                //uid
                case "u":
                    $uid = getCurrentUid();
                    if(is_array($cond)) {
                        return in_array($uid, $cond);
                    } else {
                        return $uid == $cond;
                    }
                    break;
            }
        }

    }
    
}

?>
