<?php

namespace Storage\Service;
use Common\Model\CommonModel;

class StorageService extends CommonModel {

    protected $_auto = array(
        array("company_id", "get_current_company_id", 1, "function")
    );

}