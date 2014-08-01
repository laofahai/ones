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

    protected function _filter(&$map) {
        if(isset($_GET["unhandled"])) {
            $map["status"] = array("LT", 1);
        }

        if(isset($_GET["handled"])) {
            $map["status"] = array("EGT", 1);
        }
    }
    
    
    public function read() {
        
        if(!$_GET["includeRows"] or $_GET['workflow']) {
            return parent::read();
        }
        
        $formData = parent::read(true);
        $formData["inputTime"] = $formData["dateline"]*1000;
        
        $rowModel = D("StockinDetailView");
        $rows = $rowModel->where("StockinDetail.stockin_id=".$formData["id"])->select();
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
    
    public function update() {
        $id = abs(intval($_GET["id"]));
        $model = D("Stockin");
        $data = $model->find($id);
        if($data["status"] > 0) {
            $this->error("in_workflow");
        }
        
        list($bill, $rows) = $model->formatData($_POST);
//        print_r($bill);
//        print_r($rows);exit;
        $model->editBill($bill, $rows);
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
        
        list($bill, $rows) = $stockinModel->formatData($_POST);
//
        $billId = $stockinModel->newBill($bill, $rows);
        
//        var_dump($billId);
    }

}
