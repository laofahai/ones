<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 7/17/15
 * Time: 21:57
 */

namespace Storage\Model;


use Common\Model\CommonViewModel;

class StockInDetailModel extends CommonViewModel {

    protected $viewFields = [
        'StockInDetail' => ['*', '_type'=>'left'],
        'StockIn' => [
            'bill_no',
            'subject',
            '_on'=>'StockInDetail.stock_in_id=StockIn.id',
            '_type'=>'left'
        ],
        'Product' => [
            'name'=>'product_id__label__',
            'measure_unit',
            'serial_number',
            'measure_unit' => 'quantity__after__',
            'Product.measure_unit' => 'already_in__after__',
            '_on' => 'Product.id=StockInDetail.product_id',
            '_type' => 'left'
        ],
        'Storage' => [
            'name' => 'storage_id__label__',
            '_on' => 'Storage.id=StockInDetail.storage_id',
            '_type' => 'left'
        ]
    ];

}