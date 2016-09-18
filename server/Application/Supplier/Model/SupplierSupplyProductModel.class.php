<?php

/*
 * @app Supplier
 * @package Supplier.model.SupplierSupplyProduct
 * @author laofahai@TEam Swift
 * @link http://ng-erp.com
 * */
namespace Supplier\Model;
use Common\Model\CommonViewModel;

class SupplierSupplyProductModel extends CommonViewModel {

    protected $viewFields = [
        "SupplierSupplyProduct" => ['*', '_type'=>'left']
    ];

}