<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 14-7-13
 * Time: 1:43
 */


class ONESWorkflowInitBehavior extends Behavior {

    public function run(&$params) {
        require_cache("../Lib/Workflow.class.php");
        require_cache("../Lib/WorkflowInterface.class.php");
        require_cache("../Lib/WorkflowAbstract.class.php");
    }

} 