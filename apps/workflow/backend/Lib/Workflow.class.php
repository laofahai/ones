<?php

/**
 * @filename Workflow.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-11-15  9:23:03
 * @Description
 *   
 * 工作流程序处理基类
 */
class Workflow {
    
    protected $currentWorkflow;
    
    protected $nodes;
    
    protected $nodeModel;
    
    protected $processModel;
    
    protected $context;

    private $error;
    
    public function __construct($workflowAlias, $context=array()) {
        $this->workflowAlias = $workflowAlias;
        $this->context = $context;
        $this->currentWorkflow = D("Workflow")->getByAlias($workflowAlias);//("alias='".$workflowAlias."'")->find();
//        echo D("Workflow")->getLastSql();exit;
        if(!$this->currentWorkflow) {
            //@todo
            throw_exception(L("workflow_not_found").": ".$workflowAlias);
        }
        $this->nodeModel = D("WorkflowNode");
        $this->processModel = D("WorkflowProcess");
    }
    
    /**
     * 根据流程节点获取所有处于当前节点的process
     */
    public function getRowIdsByNode($id_or_alias, $field="alias") {
        $field = $field == "alias" ? "execute_file" : "id";
        if(is_array($id_or_alias)) {
            $id_or_alias = implode(",", $id_or_alias);
        }
        if("id" !== $field) {
            $map = array(
                $field => array("IN", $id_or_alias),
                "workflow_id" => $this->currentWorkflow["id"]
            );
            $theNodes = $this->nodeModel->where($map)->select();
            foreach($theNodes as $tn) {
                $tmp[] = $tn["id"];
            }
            $id_or_alias = implode(",", $tmp);
        }
        
        
        $map = array(
            "node_id" => array("IN", $id_or_alias),
            "status" => 0
        );
        
        $data = $this->processModel->where($map)->select();
        foreach($data as $v) {
            $re[] = $v["mainrow_id"];
        }
        
        return $re;
    }
    
    /**
     * 获取当前流程所处进程
     */
    public function getCurrentProcess($mainRowid, $ignoreCheckPermission=true, $returnFields=null) {

        if(!$returnFields) {
            $returnFields = array(

            );
        }

        $map = array(
            "mainrow_id" => $mainRowid,
            "workflow_id"=> $this->currentWorkflow["id"]
        );
        $process = $this->processModel->where($map)->order("id DESC")->find();
        if(!$process) {
            return false;
        }
        $currentNode = $this->nodeModel->find($process["node_id"]);
        if(!$currentNode) {
            return false;
        }
        
        $map = array(
            "workflow_id" => $this->currentWorkflow["id"],
            "id" => array("IN", implode(",",array($currentNode["prev_node_id"],$currentNode["next_node_id"]))),  //prev_id,next_id
//            "type" => array("NEQ", 3) //排除等待外部响应的节点
        );
        $tmp = $this->nodeModel->where($map)->select();
        foreach($tmp as $k=> $an) {
            $allNodes[$an["id"]] = $an;
        }
        
        $prevNode = explode(",", $currentNode["prev_node_id"]);
        foreach($prevNode as $pn) {
            if($pn and $this->checkExecutorPermission($allNodes[$pn]["executor"])) {
                $process["prevNode"][$pn] = $allNodes[$pn];
            }
        }
        $nextNode = explode(",", $currentNode["next_node_id"]);
        
        foreach($nextNode as $pn) {
            if(!$ignoreCheckPermission and (!$this->checkExecutorPermission($allNodes[$pn]["executor"]) 
                    or !$this->checkCondition($mainRowid, $allNodes[$pn]))) {
                continue;
            }
            if($pn) {
                $process["nextNode"][$pn] = $allNodes[$pn];
                if($allNodes[$pn]["type"] != 3){ //外部响应节点
                    $process["nextActions"][$pn] = $allNodes[$pn];
                }
            }
        }
        
        $map = array(
            "status" => 1,
            "mainrow_id" => $mainRowid,
            "workflow_id" => $this->currentWorkflow["id"],
        );
        $prevProcess = $this->processModel->where($map)->order("id DESC")->find();
//        echo $this->processModel->getLastSql();exit;
        
        $process["currentNode"] = $currentNode;
        $process["prevProcess"] = $prevProcess;


        return $process;
    }
    
    /**
     * 获取列表中所有信息的所处流程，包括流程上下文
     * 1、获取当前已进行到的流程
     * 2、根据当前流程next_node_id获取可以执行的下一流程 2,3
     * 3、@todo 判断当前用户是否有权限进行下一操作
     */
    public function getListProcess($mainRowids) {
        //所有已进行流程 ?当前进行中流程
        $processViewModel = D("WorkflowProcessView");
        $tmp = $processViewModel->where(array(
            "mainrow_id" => array("IN", implode(",", $mainRowids)),
            "workflow_id" => $this->currentWorkflow["id"],
            "status" => 0
        ))->order("start_time ASC")->select();
//        print_r($tmp);exit;
        //process 无记录，则寻找第一个node
        if(!$tmp) {
            return array();
        }
        //所有需用到的node
        foreach($tmp as $k=>$v) {
            $processes[$v["mainrow_id"]] = $v;
            $processes[$v["mainrow_id"]]["nextNodes"] = explode(",", $v["next_node_id"]);
            $processes[$v["mainrow_id"]]["prevNodes"] = explode(",", $v["prev_node_id"]);
            if($v["node_id"]) {
                $ids[$v["node_id"]] = $v["node_id"];
            }
            if($v["prev_node_id"]) {
                $ids[$v["prev_node_id"]] = $v["prev_node_id"];
            }
            if($v["next_node_id"]) {
                $ids[$v["next_node_id"]] = $v["next_node_id"];
            }
        }
        $tmp = $this->nodeModel->where(array(
            "workflow_id" => $this->currentWorkflow["id"],
            "id" => array("IN", implode(",", $ids)),
//            "type" => array("NEQ", 3) //排除等待外部响应的节点
        ))->select();
//        print_r($tmp);exit;
        $needed = array("id", "workflow_id", "name", "status_text");
        foreach($tmp as $k=>$v) {
            $theNodes[$v["id"]] = filterDataFields($v, $needed);
        }
        
        //获取所有process的上一process
        $map = array(
            "workflow_id" => $this->currentWorkflow["id"],
            "mainrow_id" => array("IN", implode(",", $mainRowids)),
            "status" => 1,
        );
        
        $sql = "SELECT a.* FROM (SELECT b.* FROM __TABLE__ b ORDER BY id DESC) a
                WHERE a.mainrow_id IN (%s) AND a.status=1 GROUP BY a.mainrow_id";
        $sql = sprintf($sql,implode(",", $mainRowids));
        $tmp = $this->processModel->query($sql);
        foreach($tmp as $p) {
            $prevProcess[$p["mainrow_id"]] = $p;
        }
        
//        print_r($theNodes);exit;
//        print_r($processes);
        // 给相应流程node加入执行上下文
        foreach($processes as $k=>$v) {
            $processes[$k]["currentNode"] = $theNodes[$v["node_id"]];
            foreach($v["prevNodes"] as $i=>$pn) {
                if(!$pn or !$this->checkExecutorPermission($theNodes[$pn]["executor"])) {
                    unset($processes[$k]["nextNodes"][$i]);
                    continue;
                }
                
                $processes[$k]["prevNodes"][$i] = $theNodes[$pn];
            }
            foreach($v["nextNodes"] as $i=>$pn) {
                if(!$pn or !$this->checkExecutorPermission($theNodes[$pn]["executor"]) // 检查工作流执行权限
                        or !$this->checkCondition($k, $theNodes[$pn])) { //检查节点条件
                    unset($processes[$k]["nextNodes"][$i]);
                    continue;
                }
                $processes[$k]["nextNodes"][$i] = $theNodes[$pn];
                if($theNodes[$pn]["type"] != 3){ //外部响应节点
                    $processes[$k]["nextActions"][$i] = $theNodes[$pn];
                }
            }
            if(array_key_exists($v["mainrow_id"], $prevProcess)) {
                $processes[$k]["prevProcess"] = $prevProcess[$v["mainrow_id"]];
            }
        }


        return $processes;
        
    }
    
    /**
     * 获取当前需要执行的动作
     * @todo 判断当前流程状态是否可以执行node_id动作
     */
    public function getCurrentNode ($mainrow_id,$node_id="",$ignoreCheck=false) {

        if($node_id) {
            if(is_numeric($node_id)) {
                $node = $this->nodeModel->find($node_id);
            } else {
                $node = $this->nodeModel->where(array(
                    "workflow_id" => $this->currentWorkflow["id"],
                    "execute_file" => $node_id
                ))->find();
            }

            //当前节点上文
            $map = array(
                "workflow_id" => $this->currentWorkflow["id"],
                "mainrow_id"  => $mainrow_id
            );
            $currentProcess = $this->processModel->where($map)->order("start_time DESC")->find();
        //没有node_id参数时，尝试自动判断下一个节点
        } else {
            $map = array(
                "workflow_id" => $this->currentWorkflow["id"],
                "mainrow_id"  => $mainrow_id
            );
            //判断proccess表中是否有数据
            $currentProcess = $this->processModel->where($map)->order("start_time DESC")->find();
            unset($map["mainrow_id"]);
            if(!$currentProcess) {
                $node = $this->nodeModel->where($map)->order("listorder ASC")->limit(1)->find();
            } else {
                $prevNode = $this->nodeModel->find($currentProcess["node_id"]);
                $map["listorder"] = array(
                    "GT", $prevNode["listorder"]
                );
                $node = $this->nodeModel->where($map)->order("listorder ASC")->find();
            }
        }
        
        if(!$node and !$ignoreCheck) {
            $this->error = "workflow_not_found";
            return false;
        }
        
        if(false === $ignoreCheck) {
            if(!$this->checkExecutorPermission($node["executor"])) {
                echo json_encode(array(
                    "error" => 1,
                    "msg"   => "workflow_permission_denied"
                ));
                return false;
            }
        }
        
        $currentProcess["context"] = unserialize($currentProcess["context"]);



        $file = sprintf("@.Workflow.%s.%s", $this->currentWorkflow["workflow_file"], $node["execute_file"]);
        import($file);
        $className = $this->currentWorkflow["workflow_file"].$node["execute_file"];
//        echo $className;
        if(!$className or !class_exists($className)) {
            //检测APP目录下工作流目录
            $appConfCombined = F("appConfCombined");
            $appWorkflow = sprintf("%s/apps/%s/backend/workflow/%s/",
                ROOT_PATH,
                $appConfCombined["workflow"][$this->currentWorkflow["workflow_file"]],
                $this->currentWorkflow["workflow_file"]
            );

            $appWorkflowFile = $appWorkflow.$node["execute_file"].".class.php";

            if(is_dir($appWorkflow) && is_file($appWorkflowFile)) {
                require_cache($appWorkflowFile);
            } else {
                return false;
            }

        }
        $node["context"] = unserialize($node["context"]);
        $obj = new $className($mainrow_id, $currentProcess["context"]);
        
//        var_dump($obj);exit;
        $obj->currentNode = $node;
        $obj->context = $currentProcess["context"];
        $obj->currentWorkflow = $this->currentWorkflow;
        $obj->init($mainrow_id);
//        var_dump($obj);exit;
        return $obj;
    }
    
    /**
     * 执行下一流程
     * @todo 判断当前流程是否已执行，防止出现多人多次执行 【驳回怎么办？ context】 
     * 判断依据：1、next->current.listorder==0，说明为新建 存在process即返回
     * 2、 最新进程listorder >= 需执行进程listorder 初步认定为已执行过，判断上一条listorder
     * 3、 如果是自动执行，则不检查 $auto 参数
     * 4、另加入判断如果当前需执行节点虽然执行过，但是也属于当前需执行节点的下一节点，同样可以执行
     * @param $mainRowid
     * @param nodeId
     * @param ignoreCheck 跳过权限检测
     * @param auto true为自动执行
     *             数字为检测节点类型 如：3为等待外部响应节点
     */
    public function doNext($mainRowid, $nodeId="", $ignoreCheck=false, $auto=true) {

        $nextNodeObj = $this->getCurrentNode($mainRowid, $nodeId, $ignoreCheck);

        if(!$nextNodeObj) {
            $this->error = "get_next_node_fail";
            return false; //@todo
        }

        //$auto参数仅执行等待外部响应节点
        
        $map = array(
            "workflow_id" => $this->currentWorkflow["id"],
            "mainrow_id" => $mainRowid
        );
        $hasProcessed = false;

        if(false === $auto) {
            //当前为第一个节点
            if(0 == $nextNodeObj->currentNode["listorder"]) {
                $hasProcessed = $this->processModel->where($map)->find();
            } else {
                //最后一条执行的进程
                $tmp = $this->processModel->where($map)->order("id DESC")->find();
                //最后一次执行的节点
                $lastNode = $this->nodeModel->find($tmp["node_id"]); //最后已执行节点

                //process表存在当前节点数据，初步判定已执行过，尝试判断最后一个执行节点的下一节点是否包含当前需执行节点
                //或者判断当前需执行节点的上一节点是否包含最后一个已执行节点
                if($lastNode["listorder"] >= $nextNodeObj->currentNode["listorder"]) {

                    $theNextNodes = explode(",", $lastNode["next_node_id"]);
                    if(!in_array($lastNode["id"], $theNextNodes)){
                        $hasProcessed = true;
                    } else {
                        $hasProcessed = false;
                    }
                }
            }
        }

        if(is_numeric($auto)) {
            if(intval($nextNodeObj->currentNode["type"]) != $auto) {
                $this->error = "next_node_type_error";
                return false;
            }
        }
        
        if($hasProcessed) {
            $nextNodeObj->error("has_processed");
        }
        
        if(!$this->checkCondition($mainRowid, $nextNodeObj->currentNode)) {
            $this->error = "check_workflow_condition_fail";
            return false;
        }
        
//        echo "not processed";
//        exit;
        
//        echo $nodeId;
        $rs = $nextNodeObj->run();
        
//        var_dump($next);
        $context = $nextNodeObj->context ? $nextNodeObj->context : $this->context;
//        var_dump($rs);exit;
        //执行结果返回为true或者其他任意非 == false 值均认为已成功执行；
        if(true === $rs or !$rs) {
            $this->afterRun($mainRowid, $nextNodeObj->currentNode["id"], $context, $nextNodeObj);
        }
        return $rs;
    }
    
    /**
     * 当前工作流程逻辑执行结束后，保存当前状态进process表
     * 1、更新上一条的end_time 表明上一动作结束时间,更新上一条status为1 标示为已完成
     * 2、插入新数据，end_time为空
     * 3、判断下一节点是否为自动执行
     */
    public function afterRun($mainrowId, $nodeId, $context="", $next="") {
        
        $context ? $context : $this->context;

        $map = array(
            "mainrow_id" => $mainrowId,
            "workflow_id"=> $this->currentWorkflow["id"]
        );
        $prevProcess = $this->processModel->where($map)->order("id DESC")->limit(1)->find();

        if($prevProcess) {
            $data = array(
                "id" => $prevProcess["id"],
                "status" => 1,
                "end_time" => CTS
            );
            $this->processModel->save($data);
        }
        $memo = $context["memo"] ? $context["memo"] : ($next->memo ? $next->memo : "");
        unset($context["memo"]);
        $data = array(
            "workflow_id" => $this->currentWorkflow["id"],
            "node_id" => $nodeId,
            "mainrow_id" => $mainrowId,
//            "context" => "", //@todo 流程上下文
            "context" => serialize($context),
            "start_time" => CTS,
            "end_time" => "",
            "status"  => "0",
            "user_id" => $_SESSION["user"]["id"],
            "memo" => $memo
        );
        
        $this->processModel->add($data);
        
        /**
         * 下一节点
         */
        $curNode = $this->nodeModel->find($nodeId);
        //如果有多个动作，默认执行第一个动作（分支，条件判断等）
        //此处应为递归操作
        if($curNode["next_node_id"]) {
            if(false === strpos($curNode["next_node_id"], ",")) {
                $map = array(
                    "id" => $curNode["next_node_id"],
                );
            } else {
                $map = array(
                    "id" => array("IN", $curNode["next_node_id"]),
                    "default" => 1
                );
            }
            $nextNode = $this->nodeModel->where($map)->find();
            if($nextNode) {
                switch($nextNode["type"]) {
                    case "2":
                        $this->doNext($mainrowId, $nextNode["id"], true);
                        break;
                    default:
                        return;
                }
            }
        }
        
    }
    
    /**
     * 获取某条数据所经过的所有工作流程
     * @param $data = array(
     *  "workflowAlias" => "mainrow_id"
     * );
     */
    public function getItemProcesses($model, $id, $relationModels=array(), $relationMainrowField="source_id") {

        $workflowModel = D("Workflow");
        $models = array_merge((array)$relationModels, array($model));
        $workflows = $workflowModel->where(array(
            "workflow_file" => array("IN", implode(",", $models))
        ))->select();

        foreach($workflows as $v) {
            $theWorkflows[$v["workflow_file"]] = $v["id"];
        }

        $where = array(
            "_logic" => "OR",
            array(
                "WorkflowProcess.workflow_id" => $theWorkflows[$model],
                "WorkflowProcess.mainrow_id"  => $id,
            )
        );

        $thisRow = D($model)->find($id);

        /*
         * 相关工作流程
         * **/
        if($relationModels) {
            //当前模型不包含source_model

            //包含source_model
            if($thisRow["source_model"]) {
                $tmpModel = D($thisRow["source_model"]);

                $relationItem = $tmpModel->where("id=".$thisRow[$relationMainrowField])->find();
                if($relationItem) {
                    array_push($where, array(
                        "WorkflowProcess.workflow_id" => $theWorkflows[$thisRow["source_model"]],
                        "WorkflowProcess.mainrow_id"  => $relationItem["id"],
                    ));
                }
            } else {
                if(!is_array($relationModels)) {
                    $relationModels = explode(",", $relationModels);
                }
                foreach($relationModels as $rm) {
                    $tmpMap = array(
                        $relationMainrowField => $id,
                        "source_model" => $model
                    );
                    $tmpModel = D($rm);

                    $relationItem = $tmpModel->where($tmpMap)->find();
                    if($relationItem) {
                        array_push($where, array(
                            "WorkflowProcess.workflow_id" => $theWorkflows[$rm],
                            "WorkflowProcess.mainrow_id"  => $relationItem["id"],
                        ));
                    }
                }
            }

        }


        $processViewModel = D("WorkflowProcessView");

        $map = array(
            "_complex" => $where
        );

        $processes = $processViewModel->where($map)->order("start_time ASC")->select();

        return $processes;

    }
    
    /**
     * 检查用户可执行权限
     * eg: g:1,2|d:3,4|u:5,6
     * g: group
     * d: department
     * u: user
     */
    public function checkExecutorPermission($rules) {
        $rules = explode("|", $rules);
        $user = $_SESSION["user"];
        foreach($rules as $item) {
            list($k, $rule) = explode(":", $item);
            $ids = explode(",", $rule);
            switch($k) {
                case "g": //group
                    foreach($ids as $g) {
                        if(in_array($g, $user["group_ids"])) {
                            return true;
                        }
                    }
                    break;
                case "d": //department
                    if(in_array($user["Department"]["id"], $ids)) {
                        return true;
                    }
                    break;
                case "u": //user
                    if(in_array($user["id"], $ids)) {
                        return true;
                    }
                    break;
            }
        }
        
        return false;
    }
    
    /**
     * 检查节点执行条件
     */
    private function checkCondition($mainrowId, $node) {
        $file = sprintf("@.Workflow.%s.%s", $this->currentWorkflow["workflow_file"], $node["execute_file"]);
        import("@.Workflow.WorkflowInterface");
        import("@.Workflow.WorkflowAbstract");
        import($file);
        $className = $this->currentWorkflow["workflow_file"].$node["execute_file"];
        if(!$className or !class_exists($className)) {
            return true;
        }

        $node["context"] = unserialize($node["context"]);
        $obj = new $className($mainrowId);
        $rs = $obj->checkPermission($node["condition"]);
        return $rs === false ? false : true;
//        exit;
    }

    public function getError() {
        return $this->error;
    }
    
}