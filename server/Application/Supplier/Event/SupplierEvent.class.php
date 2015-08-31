<?php

/*
 * @app Supplier
 * @package Supplier.event.Supplier
 * @author laofahai@TEam Swift
 * @link https://ng-erp.com
 * */
namespace Supplier\Event;
use Common\Event\BaseRestEvent;

class SupplierEvent extends BaseRestEvent {

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