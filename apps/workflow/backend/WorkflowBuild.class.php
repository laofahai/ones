<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 8/23/14
 * Time: 22:29
 */

class WorkflowBuild extends CommonBuildAction {

    protected $authNodes = array(
        "workflow.workflow.*",
        "workflow.workflownode.*",
        "workflow.workflowprocess.read"
    );

} 