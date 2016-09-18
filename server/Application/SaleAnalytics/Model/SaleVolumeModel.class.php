<?php

/*
 * @app SaleAnalytics
 * @package SaleAnalytics.model.SaleVolume
 * @author laofahai@TEam Swift
 * @link http://ng-erp.com
 * */
namespace SaleAnalytics\Model;
use Common\Model\CommonViewModel;

class SaleVolumeModel extends CommonViewModel {

    protected $viewFields = [
        "SaleVolume" => ['*', '_type'=>'left']
    ];

}