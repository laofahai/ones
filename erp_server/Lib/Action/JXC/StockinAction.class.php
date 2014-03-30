<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of StockinAction
 *
 * @author nemo
 */
class StockinAction extends CommonAction {
    
    protected $indexModel = "StockinView";
    
    protected $workflowAlias = "stockin";
    
    /**
     * @override
     */
    public function insert() {
        
        if(!$_POST["data"]) {
            return;
        }
        
        $stockinModel = D("Stockin");
        
        $billData = array(
            "bill_id" => uniqid(C("BILL_PREFIX.Stockin")),
            "subject" => $_POST["subject"],
            "dateline"=> strtotime($_POST["inputTime"]),
            "status"  => 0,
            "user_id" => $this->user["id"],
            "stock_manager" => 0,
            "memo"    => $_POST["memo"]
        );
        
        $data = $_POST["data"];
        $billItems = array();
        foreach($data as $k=> $billItem) {
            $billItems[$k] = array(
                "goods_id"   => $billItem["goods_id"]["value"],
                "num"        => $billItem["num"],
                "factory_code_all" => sprintf("%s-%d-%d", 
                        $billItem["goods_id"]["factory_code"], 
                        $billItem["standard"]["value"],
                        $billItem["version"]["value"]),
                "stock_id"   => 1//$billItem["stock_id"]
            );
        }
        
        $billId = $stockinModel->newBill($billData, $billItems);
        
        
        
        
//        $stockinModel->add($billData);
        
//        echo $stockinModel->getLastSql();exit;
        
        
    }
    
}
