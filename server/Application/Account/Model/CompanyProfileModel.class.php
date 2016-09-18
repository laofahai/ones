<?php

/*
 * @app Account
 * @package Account.model.CompanyProfile
 * @author laofahai@TEam Swift
 * @link http://ng-erp.com
 * */
namespace Account\Model;
use Common\Model\CommonViewModel;

class CompanyProfileModel extends CommonViewModel {

    protected $viewFields = [
        "CompanyProfile" => ['*', '_type'=>'left'],
        "Company" => ['name'=>"company_name", '_on'=>'CompanyProfile.company_id=Company.id', '_type'=>"left"]
    ];

}