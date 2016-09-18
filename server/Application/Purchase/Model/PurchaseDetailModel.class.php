<?php

/*
 * @app Purchase
 * @package Purchase.model.PurchaseDetail
 * @author laofahai@TEam Swift
 * @link http://ng-erp.com
 * */
namespace Purchase\Model;
use Common\Model\CommonViewModel;

class PurchaseDetailModel extends CommonViewModel {

    protected $viewFields = [
        "PurchaseDetail" => ['*', '_type'=>'left'],
        'Product' => [
            'name'=>'product_id__label__',
            'measure_unit',
            'serial_number',
            'measure_unit' => 'quantity__after__',
            '_on' => 'Product.id=PurchaseDetail.product_id',
            '_type' => 'left'
        ]
    ];

}