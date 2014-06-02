<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of PurchaseAction
 *
 * @author nemo
 */
class PurchaseAction extends CommonAction {
    
    protected $workflowAlias = "purchase";
    
    protected $indexModel = "PurchaseView";
    
    public function insert() {
        
//        print_r($_POST);exit;
        
        $data = $_POST;
        
        foreach($data["rows"] as $k=>$row) {
            if(!$row or !$row["goods_id"]) {
                unset($data["rows"][$k]);
                continue;
            }
            list($fcCode, $goods_id, $catid) = explode("_", $row["goods_id"]);
            $data["rows"][$k]["goods_id"] = $goods_id;
            $data["rows"][$k]["factory_code_all"] = sprintf("%s-%s-%s", $fcCode, $row["standard"], $row["version"]);
            
            unset($data["rows"][$k]["standard"]);
            unset($data["rows"][$k]["version"]);
        }
        $data["total_price_real"] = $data["total_amount_real"];
        $data["total_price"] = $data["total_amount"];
        $data["quantity"] = $data["total_num"];
        $data["bill_id"] = makeBillCode("CG");
        $data["dateline"] = strtotime($data["inputTime"]);
        $data["user_id"] = $this->user["id"];
//        print_r($data);exit;
        $model = D("Purchase");
        $orderId = $model->newPurchase($data);
        if(!$orderId) {
            $this->error($model->getError());
        }
        
        import("@.Workflow.Workflow");
        $workflow = new Workflow($this->workflowAlias);
        $node = $workflow->doNext($orderId, "", true);
    }
    
}
