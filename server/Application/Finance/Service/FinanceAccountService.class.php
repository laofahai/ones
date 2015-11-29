<?php

/*
 * @app Finance
 * @package Finance.service.FinanceAccount
 * @author laofahai@TEam Swift
 * @link https://ng-erp.com
 * */
namespace Finance\Service;
use Common\Model\CommonModel;

class FinanceAccountService extends CommonModel {

    protected $_auto = [
        ["company_id", "get_current_company_id", 1, "function"]
    ];

}