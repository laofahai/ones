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
    
    public function index() {
        $workflow_id = abs(intval($_GET["workflow_id"]));
        if(!$workflow_id) {
            $this->redirect("/HOME/Workflow");
        }
        $workflow = D("Workflow");
        $theWorkflow = $workflow->find($workflow_id);
        if(!$theWorkflow) {
            $this->redirect("/HOME/Workflow");
        }
        $this->assign("theWorkflow", $theWorkflow);
        $_REQUEST["order"] = "listorder";
        $_REQUEST["sort"] = "ASC";
        parent::index("WorkflowDetailView");
    }
    
}

?>
