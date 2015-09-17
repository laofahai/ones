<?php

/*
 * @app SaleAnalytics
 * @package SaleAnalytics.service.SaleVolume
 * @author laofahai@TEam Swift
 * @link https://ng-erp.com
 * */
namespace SaleAnalytics\Service;
use Common\Model\CommonModel;

class SaleVolumeService extends CommonModel {

    protected $_auto = [
        ["user_id", "get_current_user_id", 1, "function"],
        ["company_id", "get_current_company_id", 1, "function"]
    ];

}