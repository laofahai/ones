<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of PurchaseModel
 *
 * @author 志鹏
 */
class PurchaseModel extends CommonModel {
    
    protected $workflowAlias = "purchase";
    
    public $relationModels = "Stockin,Stockout";
    
    protected $_auto = array(
        array("dateline", CTS),
        array("status", 0),
        array("total_num", 0),
        array("total_price", 0),
        array("total_price_real", 0),
        array("bill_code", "makeBillCode", 1, "function"),
        array("saler_id", "getCurrentUid", 1, "function"),
    );
    
    public function newBill($data) {
        if(!$data["rows"]) {
            return;
        }

        if(!$this->checkFactoryCodeAll($data["rows"])) {
            $this->error = "factory_code_not_full";
            return false;
        }
        
        $this->startTrans();
        
        $purchaseId = $this->add($data);

        if(!$purchaseId) {
            $this->error = "insert purchase bill failed";
            Log::write("SQL Error:".$this->getLastSql(), Log::SQL);
            $this->rollback();
            return false;
        }
        
        $detailModel = D("PurchaseDetail");
        foreach($data["rows"] as $row) {
            $row["purchase_id"] = $purchaseId;
            $row["price"] = $row["amount"];
            if(!$detailModel->add($row)) {
                $this->error = "insert purchase bill detail failed";
                Log::write("SQL Error:".$detailModel->getLastSql(), Log::SQL);
                $this->rollback();
                return false;
            }
        }
        
        $this->commit();

        $workflow = new Workflow($this->workflowAlias);
        $workflow->doNext($purchaseId, "", true);
        
        return $purchaseId;
    }

    public function editBill($data) {
        $this->startTrans();
        $rows = $data["rows"];
        unset($data["rows"]);

        if(!$this->checkFactoryCodeAll($rows)) {
            $this->error = "factory_code_not_full";
            return false;
        }

        if(false === $this->save($data)) {
            $this->error = "edit purchase bill failed";
            Log::write("SQL Error:".$this->getLastSql(), Log::SQL);
            $this->rollback();
            return false;
        }

        $detailModel = D("PurchaseDetail");

        $map = array(
            "purchase_id"=>$data["id"]
        );
        $this->removeDeletedRows($rows, $map, $detailModel);

        foreach($rows as $row) {
            $row["purchase_id"] = $data["id"];
            $row["price"] = $row["price"] ? $row["price"] : $row["amount"];
            $method = $row["id"] ? "save" : "add";
            if(false === $detailModel->$method($row)) {
                $this->error = "edit purchase bill detail failed";
                Log::write("SQL Error:".$detailModel->getLastSql(), Log::SQL);
                $this->rollback();
                return false;
            }
        }

        $this->commit();
        return $data["id"];
    }

    public function formatData($data) {
        foreach($data["rows"] as $k=>$row) {
            if(!$row or !$row["goods_id"]) {
                unset($data["rows"][$k]);
                continue;
            }
            list($fcCode, $goods_id, $catid) = explode("_", $row["goods_id"]);
            $data["rows"][$k]["goods_id"] = $goods_id;
            $data["rows"][$k]["price"] = $row["price"] ? $row["price"] : 0;
            $data["rows"][$k]["factory_code_all"] = makeFactoryCode($row, $fcCode);
        }
//        $data["total_price_real"] = $data["total_amount_real"];
//        $data["total_price"] = $data["total_amount"];
//        $data["quantity"] = $data["total_num"];

        $data["purchase_type"] = $data["purchase_type"] ? $data["purchase_type"] : 0;
        $data["supplier_id"] = $data["supplier_id"] ? $data["supplier_id"] : 0;

        $data["bill_id"] = makeBillCode("CG");
        $data["dateline"] = $data["inputTime"] ? strtotime($data["inputTime"]) : CTS;
        $data["user_id"] = getCurrentUid();


        return $data;
    }

    public function toRelatedItem($sourceModel, $sourceId) {
        $map = array(
            "source_model" => $sourceModel,
            "source_id"    => $sourceId
        );
        return $this->field(
            "id,bill_id,'Purchase' AS type,'shopping-cart' AS icon,'purchase/editBill/purchase/id/' AS link"
        )->where($map)->order("id ASC")->select();
    }

    public function getRelatedItem($source_id) {
        return $this->field(
            "id,bill_id,'Purchase' AS type,'shopping-cart' AS icon,'purchase/editBill/purchase/id/' AS link"
        )->find($source_id);
    }
    
}

