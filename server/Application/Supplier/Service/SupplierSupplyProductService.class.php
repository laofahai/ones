<?php

/*
 * @app Supplier
 * @package Supplier.service.SupplierSupplyProduct
 * @author laofahai@TEam Swift
 * @link http://ng-erp.com
 * */
namespace Supplier\Service;
use Common\Model\CommonModel;

class SupplierSupplyProductService extends CommonModel {

    protected $_auto = [
        ["company_id", "get_current_company_id", 1, "function"]
    ];

}