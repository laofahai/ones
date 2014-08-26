<?php

/**
 * @filename WorkflowNodeViewModel.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
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
