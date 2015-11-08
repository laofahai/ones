<?php

/*
 * @app Finance
 * @package Finance.model.Payables
 * @author laofahai@TEam Swift
 * @link https://ng-erp.com
 * */
namespace Finance\Model;
use Common\Model\CommonViewModel;

class PayablesModel extends CommonViewModel {

    protected $viewFields = [
        "Payables" => ['*', '_type'=>'left']
    ];

}