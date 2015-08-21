<?php

namespace Bpm\Model;
use Common\Model\CommonViewModel;

class WorkflowNodeModel extends CommonViewModel {

    protected $viewFields = array(
        "WorkflowNode" => array('*', '_type'=>'left')
    );

}