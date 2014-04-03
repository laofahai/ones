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
    
    public function read() {
        if(!$_GET["includeRows"]) {
            return parent::read();
        }
        
        $formData = parent::read(true);
        $formData["inputTime"] = $formData["dateline"]*1000;
        
        $rowModel = D("StockinDetailView");
        $rows = $rowModel->where("stockin_id=".$formData["id"])->select();
        $modelIds = array();
        $rowData = array();
        foreach($rows as $v) {
            $tmp = explode("-", $v["factory_code_all"]);
            array_shift($tmp);
            $modelIds = array_merge($modelIds, $tmp);
            $v["modelIds"] = $tmp;
            $rowData[$v["id"]] = $v;
        }
        array_flip(array_flip($modelIds));

        $dataModel = D("DataModelDataView");
        $tmp = $dataModel->where(array(
            "id" => array("IN", implode(",", $modelIds))
        ))->select();
        
        foreach($tmp as $v) {
            $modelData[$v["id"]] = $v;
        }
        
        foreach($rowData as $k=>$v) {
            if(!$v["modelIds"]) {
                continue;
            }
            foreach($v["modelIds"] as $mid) {
                $rowData[$k][$modelData[$mid]["field_name"]] = $modelData[$mid]["data"];
            }
        }
        
        $formData["rows"] = reIndex($rowData);
        $this->response($formData);
        
    }
    
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
            "total_num"=> $_POST["totalnum"],
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
                        $billItem["standard"],
                        $billItem["version"]),
                "memo" => $billItem["memo"],
                "stock_id"   => $billItem["stock"]//$billItem["stock_id"]
            );
        }
        
//        print_r($billItems);exit;
        
        $billId = $stockinModel->newBill($billData, $billItems);
        
        var_dump($billId);
    }
    
    public function _after_delete() {
        $id = $_REQUEST["id"];
        $model = D("StockinDetail");
        $model->where(array(
            "stockin_id" => array("IN", $id)
        ))->delete();
        $workflow = D("Workflow")->getByAlias($this->workflowAlias);
        $model = D("WorkflowProcess");
        $model->where(array(
            "mainrow_id" => array("IN", $id),
            "workflow_id"=> $workflow["id"]
        ))->delete();
    }
    
}
