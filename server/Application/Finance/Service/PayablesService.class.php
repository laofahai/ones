<?php

/*
 * @app Finance
 * @package Finance.service.Payables
 * @author laofahai@TEam Swift
 * @link https://ng-erp.com
 * */
namespace Finance\Service;
use Common\Model\CommonModel;

class PayablesService extends CommonModel {

    protected $_auto = [
        ["user_info_id", "get_current_user_id", 1, "function"],
        ["company_id", "get_current_company_id", 1, "function"]
    ];

}