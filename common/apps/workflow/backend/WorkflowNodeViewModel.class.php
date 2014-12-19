<?php

/**
 * @filename WorkflowNodeViewModel.class.php 
 * @encoding UTF-8 
 * @author 闫志鹏 <a href="mailto:dk_nemo@163.com">dk_nemo@163.com</a>
 *
 *
 * @datetime 2013-11-16  17:05:45
 * @Description
 * 
 */
class WorkflowNodeViewModel extends ViewModel {
    protected $viewFields = array(
        "WorkflowNode" => array("*", "_type"=>"left"),
        "Workflow" => array("alias"=>"workflow_alias", "_on"=> "Workflow.id=WorkflowNode.workflow_id", "_type"=>"left")
    );
}

?>
