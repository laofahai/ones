<?php

/*
 * @app Supplier
 * @package Supplier.controller.Supplier
 * @author laofahai@TEam Swift
 * @link https://ng-erp.com
 * */
namespace Supplier\Controller;
use Common\Controller\BaseRestController;

class SupplierController extends BaseRestController {

    protected function _filter(&$map) {
        // X级以上
        if($map['gt_level']) {
            $map['supplier.level'] = ['EGT', $map['gt_level']];
            unset($map['gt_level']);
        }

        // 仅查询产品供应商
        if($map['product_id']) {
            unset($map['product_id']);
        }
    }
}