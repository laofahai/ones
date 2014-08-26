<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of ProductTplRelModel
 *
 * @author nemo
 */
class ProductTplRelModel extends CommonRelationModel {
    
    protected $tableName = "product_tpl";
    
    protected $_link = array(
        "ProductTplDetail" => array(
            "mapping_type" => HAS_MANY,
            "foreign_key"  => "tpl_id",
            "mapping_name"  => "rows"
        )
    );
    
}
