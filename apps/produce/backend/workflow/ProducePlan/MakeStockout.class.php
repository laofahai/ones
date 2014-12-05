<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of MakeStockout
 *
 * @author nemo
 */
class ProducePlanMakeStockout extends WorkflowAbstract {
    
    public function run() {
        
        $bomModel = D("ProduceBoms");
        $stockoutModel = D("Stockout");
        $stockoutDetailModel = D("StockoutDetail");
        
        $theBoms = $bomModel->where("plan_id=".$this->mainrowId)->select();
        
        $stockoutModel->startTrans();
        
        $theStockout = array(
            "bill_id" => makeBillCode("CK"),
            "source_id" => $this->mainrowId,
            "source_model" => "ProducePlan",
            "dateline"  => CTS,
            "total_num" => 0,
            "stock_manager" => 0,
            "shipment_id"   => 0,
            "status" => 0,
            "memo" => "ProducePlan #".$this->mainrowId
        );
        
        $stockoutId = $stockoutModel->add($theStockout);
        
        if(!$stockoutId) {
            Log::write("SQL Error:".$stockoutModel->getLastSql(), Log::SQL);
            $stockoutModel->rollback();
            $this->response(array(
                "type"=> "message",
                "msg" => "Server Error.",
                "error"=> 1
            ));
        }
        
        $totalNum = 0;
        foreach($theBoms as $k=>$v) {
            $totalNum += $v["num"];
            $theDetail = array(
                "stockout_id" => $stockoutId,
                "factory_code_all" => $v["factory_code_all"],
                "goods_id" => $v["goods_id"],
                "stock_id" => 0,
                "num"      => $v["num"]
            );
            if(!$stockoutDetailModel->add($theDetail)) {
                //@todo
                Log::write("SQL Error:".$stockoutModel->getLastSql(), Log::SQL);
                $stockoutModel->rollback();
                $this->response(array(
                    "type"=> "message",
                    "msg" => "Server Error.",
                    "error"=> 1
                ));
            }
        }
        
        $stockoutModel->where("id=".$stockoutId)->save(array(
            "total_num" => $totalNum
        ));
        
//        echo $stockoutModel->getLastSql();exit;
        
        $stockoutModel->commit();
        
        $workflow = new Workflow("stockout");
        $workflow->doNext($stockoutId, false, true, false);
        
//        print_r($theBoms);exit;
    }
    
}
