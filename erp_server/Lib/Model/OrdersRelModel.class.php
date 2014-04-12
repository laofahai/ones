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
    
    public function newOrder($data) {
        
        if(!$data["rows"]) {
            return false;
        }
        
        $this->startTrans();
        
        $orderId = $this->add($data);

        if(!$orderId) {
                    echo $this->getLastSql();exit;
            $this->rollback();
            return false;
        }
//        print_r($data["rows"]);exit;
        $detail = D("OrdersDetail");
        foreach($data["rows"] as $row) {
            $row["order_id"] = $orderId;
            if(!$detail->add($row)) {
//                echo $detail->getLastSql();exit;
                $this->rollback();
                break;
            }
        }
        
        $this->commit();
        
        return $orderId;
//        echo $orderId;exit;
    }
    
}
