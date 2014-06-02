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
        
        if(!$_GET["includeRows"] or $_GET['workflow']) {
            return parent::read();
        }
        
        $formData = parent::read(true);
        $formData["inputTime"] = $formData["dateline"]*1000;
        
        $rowModel = D("StockinDetailView");
        $rows = $rowModel->where("StockinDetail.stockin_id=".$formData["id"])->select();
//        echo $rowModel->getLastSql();exit;
        $modelIds = array();
        $rowData = array();
        foreach($rows as $v) {
            $tmp = explode("-", $v["factory_code_all"]); //根据factory_code_all factory_code - standard - version
            $factory_code = array_shift($tmp);
            $modelIds = array_merge($modelIds, $tmp);
            $v["modelIds"] = $tmp;
            $v["stock"] = $v["stock_id"];
            $v["stock_label"] = $v["stock_name"];
            $v["goods_id"] = sprintf("%s_%s_%s", $factory_code, $v["goods_id"], $v["goods_category_id"]); // factory_code, id, catid
            $v["goods_id_label"] = sprintf("%s",$v["goods_name"]);
            $rowData[$v["id"]] = $v;
        }
//        array_flip(array_flip($modelIds));

        $dataModel = D("DataModelDataView");
        
        
        $rowData = $dataModel->assignModelData($rowData, $modelIds);
        
        $formData["rows"] = reIndex($rowData);
        
        
        $this->response($formData);
        
    }
    
    /**
     * @override
     */
    public function insert() {
        
        if($_POST["workflow"]) {
            return $this->doWorkflow();
        }
        
        if(!$_POST["rows"]) {
            return;
        }
        
        $stockinModel = D("Stockin");
        
        $billData = array(
            "bill_id" => makeBillCode(C("BILL_PREFIX.Stockin")),
            "subject" => $_POST["subject"],
            "dateline"=> strtotime($_POST["inputTime"]),
            "status"  => 0,
            "user_id" => $this->user["id"],
            "stock_manager" => 0,
            "total_num"=> $_POST["total_num"],
            "memo"    => $_POST["memo"]
        );
        
        $data = $_POST["rows"];
        $billItems = array();
        foreach($data as $k=> $billItem) {
            if(!$billItem) {
                continue;
            }
            list($factory_code, $goodsId, $catid) = explode("_", $billItem["goods_id"]);
            $billItems[$k] = array(
                "goods_id"   => $goodsId,
                "num"        => $billItem["num"],
                "factory_code_all" => sprintf("%s-%d-%d", 
                        $factory_code, 
                        $billItem["standard"],
                        $billItem["version"]),
                "memo" => $billItem["memo"],
                "stock_id"   => $billItem["stock"]//$billItem["stock_id"]
            );
        }
        
//        print_r($billData);
//        print_r($billItems);exit;
//        
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
