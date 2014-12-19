<?php

/**
 * @filename WorkflowProcessViewModel.class.php 
 * @encoding UTF-8 
 * @author 闫志鹏 <a href="mailto:dk_nemo@163.com">dk_nemo@163.com</a>
 *
 *
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
