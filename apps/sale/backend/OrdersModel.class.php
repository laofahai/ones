<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of OrdersModel
 *
 * @author 志鹏
 */
class OrdersModel extends CommonModel {
    
    protected $workflowAlias = "orders";
    
    protected $_auto = array(
        array("dateline", CTS),
        array("status", 0),
        array("total_num", 0),
        array("total_price", 0),
        array("total_price_real", 0),
        array("bill_code", "makeBillCode", 1, "function"),
        array("saler_id", "getCurrentUid", 1, "function"),
    );

    public $relationModels = array(
        "Stockout"
    );
    
    public function newOrder($data) {
        
        if(!$data["rows"]) {
            return false;
        }
        
        $method = $data["id"] ? "save" : "add";
        
        $this->startTrans();
        
        if($method == "save") {
            unset($data["saler_id"]);
            unset($data["status"]);
            unset($data["bill_id"]);
            unset($data["order_id"]);
            unset($data["deleted"]);
        }
        
        $orderId = $this->$method($data);

        if(false === $orderId) {
            Log::write("SQL Error:".$this->getLastSql(), Log::SQL);
            $this->rollback();
            return false;
        }



//        print_r($data["rows"]);exit;
        $detail = D("OrdersDetail");

        if($data["id"]) {
            $map = array(
                "order_id" => $data["id"]
            );
            $this->removeDeletedRows($data["rows"], $map, $detail);
        }

        foreach($data["rows"] as $row) {
            if($method !== "save") {
                $row["order_id"] = $orderId;
            } else {
                unset($row["order_id"]);
            }
            $rs = $detail->$method($row);
            if(false === $rs) {
                Log::write("SQL Error:".$this->getLastSql(), Log::SQL);
                $this->rollback();
                break;
            }
        }
        
        $this->commit();
        
        return $orderId;
//        echo $orderId;exit;
    }
    
    public function formatData($data) {
        foreach($data["rows"] as $k=>$row) {
            if(!$row or !$row["goods_id"]) {
                unset($data["rows"][$k]);
                continue;
            }
            list($fcCode, $goods_id, $catid) = explode("_", $row["goods_id"]);
            $data["rows"][$k]["goods_id"] = $goods_id;
            $data["rows"][$k]["factory_code_all"] = makeFactoryCode($row, $fcCode);
            
            unset($data["rows"][$k]["standard"]);
            unset($data["rows"][$k]["version"]);
        }
        
        $id = abs(intval($_GET["id"]));
        if($id) {
            $data["id"] = $id;
        }
        
        $data["bill_id"] = makeBillCode("XS");
        if($data["inputTime"] && !$id) {
            $data["dateline"] = strtotime($data["inputTime"]);
        } else {
            unset($data["dateline"]);
        }
        
        $data["saler_id"] = getCurrentUid();
        
        unset($data["customerInfo"]);
        unset($data["discount"]);
        unset($data["inputTime"]);
        
        return $data;
    }
    
}
