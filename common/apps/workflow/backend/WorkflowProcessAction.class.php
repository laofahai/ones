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
        
        $modelName = ucfirst($workflowAlias);
        $model =  D($modelName);

        $workflow = new Workflow($workflowAlias);
        $process = $workflow->getItemProcesses($modelName, $mainrowId, $model->relationModels);
        
        $this->response($process);
    }
    
}

?>
