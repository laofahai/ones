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
    
    public function newPurchase($data) {
        if(!$data["rows"]) {
            return;
        }
        
        $this->startTrans();
        
        $purchaseId = $this->add($data);
//        echo $this->getLastSql();exit;
        if(!$purchaseId) {
            $this->rollback();
            return false;
        }
        
        $detailModel = D("PurchaseDetail");
        foreach($data["rows"] as $row) {
            $row["purchase_id"] = $purchaseId;
            $row["price"] = $row["amount"];
            if(!$detailModel->add($row)) {
                $this->rollback();
                return false;
            }
        }
        
        $this->commit();
        
        return $purchaseId;
    }
    
}

?>
