<?php

namespace Bpm\Service;
use Common\Model\CommonModel;

class WorkflowNodeService extends CommonModel {

    protected $_auto = array(
        array("company_id", "get_current_company_id", self::MODEL_INSERT, "function")
    );


}