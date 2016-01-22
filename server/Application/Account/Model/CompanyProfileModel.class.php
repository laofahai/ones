<?php

/*
 * @app Account
 * @package Account.model.CompanyProfile
 * @author laofahai@TEam Swift
 * @link https://ng-erp.com
 * */
namespace Account\Model;
use Common\Model\CommonViewModel;

class CompanyProfileModel extends CommonViewModel {

    protected $viewFields = [
        "CompanyProfile" => ['*', '_type'=>'left']
    ];

}