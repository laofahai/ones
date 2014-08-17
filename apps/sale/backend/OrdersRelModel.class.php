<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of OrdersRelModel
 *
 * @author nemo
 */
class OrdersRelModel extends RelationModel {
    
    protected $tableName = "Orders";
    
    protected $_link = array(
        "OrdersDetail" => array(
            "mapping_type" => HAS_MANY,
            "class_name" => "OrdersDetail",
            "mapping_name" => "rows",
            "foreign_key" => "order_id"
        )
    );
    
    
    
}
