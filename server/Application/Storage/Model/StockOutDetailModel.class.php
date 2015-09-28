<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 7/17/15
 * Time: 21:57
 */

namespace Storage\Model;


use Common\Model\CommonViewModel;

class StockOutDetailModel extends CommonViewModel {

    protected $viewFields = [
        'StockOutDetail' => ['*', '_type'=>'left'],
        'StockOut' => [
            'bill_no',
            'subject',
            '_on'=>'StockOutDetail.stock_out_id=StockOut.id',
            '_type'=>'left'
        ],
        'Product' => [
            'name'=>'product_id__label__',
            'measure_unit',
            'serial_number',
            'measure_unit' => 'quantity__after__',
            'Product.measure_unit' => 'already_out__after__',
            '_on' => 'Product.id=StockOutDetail.product_id',
            '_type' => 'left'
        ],
        'Storage' => [
            'name' => 'storage_id__label__',
            '_on' => 'Storage.id=StockOutDetail.storage_id',
            '_type' => 'left'
        ],
        'Stock' => [
            'balance' => 'stock_quantity',
            '_on' => 'Stock.product_unique_id=StockOutDetail.product_unique_id AND Stock.storage_id=StockOutDetail.storage_id',
            '_type' => 'left'
        ]
    ];

}