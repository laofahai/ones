<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 14-8-13
 * Time: 0:09
 */

class WorkflowRelationModel extends CommonRelationModel {

    protected $_link = array(
        "WorkflowNode" => HAS_MANY,
        "WorkflowProcess" => HAS_MANY,
    );

} 