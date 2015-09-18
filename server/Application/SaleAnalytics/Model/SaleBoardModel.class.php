<?php

/*
 * @app SaleAnalytics
 * @package SaleAnalytics.model.SaleBoard
 * @author laofahai@TEam Swift
 * @link https://ng-erp.com
 * */
namespace SaleAnalytics\Model;
use Common\Model\CommonViewModel;

class SaleBoardModel extends CommonViewModel {

    protected $viewFields = [
        "SaleBoard" => ['*', '_type'=>'left']
    ];

}