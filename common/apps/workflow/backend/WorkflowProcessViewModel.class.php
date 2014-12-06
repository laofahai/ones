<?php

/**
 * @filename WorkflowProcessViewModel.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-11-15  15:33:43
 * @Description
 * 
 */
class WorkflowProcessViewModel extends ViewModel {
    
    protected $viewFields = array(
        "WorkflowProcess" => array("*", "_type"=>"left"),
        "WorkflowNode" => array("prev_node_id", "next_node_id", "status_text", "status_class", "name"=>"nodeName", "_on"=>"WorkflowNode.id=WorkflowProcess.node_id", "_type"=>"left"),
        "User" => array("truename", "_on"=>"WorkflowProcess.user_id=User.id", "_type"=>"left")
    );
    
}

?>
