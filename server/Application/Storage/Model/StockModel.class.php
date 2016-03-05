<?php

namespace Storage\Model;
use Common\Model\CommonViewModel;

class StockModel extends CommonViewModel {

    protected $viewFields = array(
        "Stock" => array('*', '_type'=>'left'),
        "Storage" => array('name' => 'storage_name', '_on'=>"Stock.storage_id=Storage.id", "_type"=>"left"),
        "Product" => array('name'=>'product_name', 'serial_number', 'product_category_id', 'measure_unit', '_on'=>'Stock.product_id=Product.id', '_type'=>'left'),
        "ProductCategory" => ['name'=>'product_category', '_on'=>'Product.product_category_id=ProductCategory.id', '_type'=>'left']
    );

    public $fuzzy_search = [
        'Product.name', 'Product.serial_number'
    ];

}