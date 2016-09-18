<?php

/*
 * @app Sale
 * @package Sale.model.OrdersDetail
 * @author laofahai@TEam Swift
 * @link http://ng-erp.com
 * */
namespace Sale\Model;
use Common\Model\CommonViewModel;

class OrdersDetailModel extends CommonViewModel {

    protected $viewFields = [
        "OrdersDetail" => ['*', '_type'=>'left'],
        'Product' => [
            'name'=>'product_id__label__',
            'measure_unit',
            'serial_number',
            'measure_unit' => 'quantity__after__',
            'Product.measure_unit' => 'already_in__after__',
            '_on' => 'Product.id=OrdersDetail.product_id',
            '_type' => 'left'
        ],
        "Orders" => [
            "_on" => "Orders.id=OrdersDetail.id",
            "_type" => "left"
        ]
    ];

}