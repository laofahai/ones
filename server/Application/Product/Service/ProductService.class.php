<?php

namespace Product\Service;
use Common\Model\CommonRelationModel;

class ProductService extends CommonRelationModel {

    protected $_link = array(
        "category" => array(
            "mapping_type" => self::BELONGS_TO,
            "class_name"   => "Product/ProductCategory"
        )
    );

    protected $_auto = [
        array("company_id", "get_current_company_id", 1, "function")
    ];
    
}