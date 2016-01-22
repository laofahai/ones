w<?php

namespace Marketing\Service;
use Common\Model\CommonModel;

class SaleOpportunitiesProductService extends CommonModel {

    protected $_auto = array(
        array("user_info_id", "get_current_user_id", 1, "function"),
        array("company_id", "get_current_company_id", 1, "function")
    );

}