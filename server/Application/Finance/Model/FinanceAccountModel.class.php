<?php

/*
 * @app Finance
 * @package Finance.model.FinanceAccount
 * @author laofahai@TEam Swift
 * @link http://ng-erp.com
 * */
namespace Finance\Model;
use Common\Model\CommonViewModel;

class FinanceAccountModel extends CommonViewModel {

    protected $viewFields = [
        "FinanceAccount" => ['*', '_type'=>'left']
    ];

}