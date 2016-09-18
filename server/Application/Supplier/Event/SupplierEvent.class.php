<?php

/*
 * @app Supplier
 * @package Supplier.event.Supplier
 * @author laofahai@TEam Swift
 * @link http://ng-erp.com
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

    // 获得商品单价
    public function _EM_fetch_product_unit_price() {

        $response_data = [
            'source_price' => '',
            'supply_price' => ''
        ];

        // 获取原价
        $map = [
            'id' => I('get.product_id')
        ];
        $response_data['source_price'] = D('Product/Product')->where($map)->getField('price');

        if(I('get.supplier_id')) {
            // 获取供应商供应价格
            $map = [
                'product_id' => I('get.product_id'),
                'product_unique_id' => generate_product_unique_id(I('get.')),
                'supplier_id' => D('Supplier/Supplier')->where(['contacts_company_id'=>I('get.supplier_id')])->getField('id')
            ];
            $response_data['supply_price'] = D('Supplier/SupplierSupplyProduct')->where($map)->getField('supply_price');
        }

        $response_data['source_price'] = (float)$response_data['source_price'];
        $response_data['supply_price'] = (float)$response_data['supply_price'];

        $this->response($response_data);

    }
}