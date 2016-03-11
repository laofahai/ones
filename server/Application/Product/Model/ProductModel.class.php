<?php

namespace Product\Model;
use Common\Model\CommonViewModel;

class ProductModel extends CommonViewModel {
    
    protected $viewFields = array(
        "Product" => array("*", '_type'=>"left"),
        "ProductCategory" => array(
            "name" => "product_category_id__label__",
            "_on"=>"Product.product_category_id=ProductCategory.id",
            "_type" => "left"
        )
    );

    public $orderFields = ['id', 'product_category_id'];

    public $fuzzy_search = [
        'Product.name',
        'Product.serial_number',
        'ProductCategory.name'
    ];
    
}