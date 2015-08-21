<?php

namespace Product\Service;
use Common\Model\CommonRelationModel;

class ProductCategoryService extends CommonRelationModel {

    protected $_auto = [
        array("company_id", "get_current_company_id", 1, "function")
    ];
    
    protected $_link = array(
        "products" => array(
            "mapping_type" => self::HAS_MANY,
            "class_name"   => "Product/Product"
        )
    );

}