<?php

namespace Storage\Model;
use Common\Model\CommonViewModel;

class StockInModel extends CommonViewModel {

    protected $viewFields = array(
        "StockIn" => array('*', '_type'=>'left'),
        "Workflow" => [
            "name" => "workflow_id__label__",
            "_on" => "Workflow.id=StockIn.workflow_id",
            "_type" => "left"
        ]
    );

}