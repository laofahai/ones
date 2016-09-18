<?php

/*
 * @app Region
 * @package Region.model.Region
 * @author laofahai@TEam Swift
 * @link http://ng-erp.com
 * */
namespace Region\Model;
use Common\Model\CommonViewModel;

class RegionModel extends CommonViewModel {

    public $not_belongs_to_company = true;

    protected $viewFields = [
        "Region" => ['*', '_type'=>'left']
    ];

}