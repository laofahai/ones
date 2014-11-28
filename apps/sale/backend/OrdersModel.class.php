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

    protected $readonlyField = array(
        "bill_id","sale_id","dateline"
    );
    
    public function newOrder($data) {
        
        if(!$data["rows"]) {
            return false;
        }

        //检测每行产品及数据是否完整
        if(!$this->checkFactoryCodeAll($data["rows"])) {
            $this->error = "factory_code_not_full";
            return false;
        }

        $needed = array(
            "num","discount","unit_price","amount"
        );
        if(!checkParamsFullMulti($data["rows"], $needed)) {
            $this->error = "";
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

        if(!$orderId && $data["id"]) {
            $orderId = $data["id"];
        }

        if(false === $orderId) {
            Log::write("SQL Error:".$this->getLastSql(), Log::SQL);
            $this->rollback();
            return false;
        }


        $detail = D("OrdersDetail");

        if($data["id"]) {
            $map = array(
                "order_id" => $data["id"]
            );
            $this->removeDeletedRows($data["rows"], $map, $detail);
        }

        foreach($data["rows"] as $row) {

            $rowMethod = $row["id"] ? "save" : "add";

            if($rowMethod == "add") {
                $row["order_id"] = $orderId;
            } else {
                unset($row["order_id"]);
            }

            $rs = $detail->$rowMethod($row);
            if(false === $rs) {
                Log::write("SQL Error:".$this->getLastSql(), Log::SQL);
                $this->rollback();
                break;
            }
        }
        
        $this->commit();

        return $orderId;
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
