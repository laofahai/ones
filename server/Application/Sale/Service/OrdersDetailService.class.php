<?php

/*
 * @app Sale
 * @package Sale.service.OrdersDetail
 * @author laofahai@TEam Swift
 * @link http://ng-erp.com
 * */
namespace Sale\Service;
use Common\Model\CommonModel;

class OrdersDetailService extends CommonModel {

    protected $_auto = [
        ["company_id", "get_current_company_id", 1, "function"]
    ];

}