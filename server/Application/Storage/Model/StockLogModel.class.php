<?php

/*
 * @app Storage
 * @package Storage.model.StockLog
 * @author laofahai@TEam Swift
 * @link http://ng-erp.com
 * */
namespace Storage\Model;
use Common\Model\CommonViewModel;

class StockLogModel extends CommonViewModel {

    protected $viewFields = [
        "StockLog" => ['*', '_type'=>'left'],
        "Storage" => [
            'name' => 'storage_name',
            '_on'  => 'Storage.id=StockLog.storage_id',
            '_type'=> 'left'
        ],
        "Product"  => [
            'name' => 'product_name',
            'measure_unit',
            'serial_number',
            '_on'  => 'StockLog.product_id=Product.id',
            '_type'=> 'left'
        ]
    ];

}