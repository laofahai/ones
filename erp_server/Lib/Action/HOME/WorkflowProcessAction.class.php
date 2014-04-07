<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of WorkflowProcessAction
 *
 * @author 志鹏
 */
class WorkflowProcessAction extends CommonAction {
    
    public function read() {
        $mainrowId = $_GET["id"];
        $workflowAlias = $_GET["workflowAlias"];
        
        $workflow = D("Workflow")->getByAlias($workflowAlias);
        
        $model = D("WorkflowProcessView");
        $process = $model->where(array(
            "workflow_id" => $workflow["id"],
            "mainrow_id"  => $mainrowId
        ))->order("start_time ASC")->select();
        
        $this->response($process);
    }
    
}

?>
