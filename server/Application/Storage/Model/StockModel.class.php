<?php

namespace Storage\Model;
use Common\Model\CommonViewModel;

class StockModel extends CommonViewModel {

    protected $viewFields = array(
        "Stock" => array('*', '_type'=>'left'),
        "Storage" => array('name' => 'storage_name', '_on'=>"Stock.storage_id=Storage.id", "_type"=>"left"),
        "Product" => array('name'=>'product_name', 'measure_unit', '_on'=>'Stock.product_id=Product.id', '_type'=>'left')
    );

}