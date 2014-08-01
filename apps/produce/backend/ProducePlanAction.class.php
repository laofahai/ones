<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of ProducePlanAction
 *
 * @author nemo
 */
class ProducePlanAction extends CommonAction {
    
    public $workflowAlias = "produce";
    
    protected $indexModel = "ProducePlanView";
    
    public function read() {
        if(!$_GET["includeRows"] or $_GET['workflow']) {
            return parent::read();
        }
        
        $formData = parent::read(true);
        $formData["inputTime"] = $formData["dateline"]*1000;
        
        $rowModel = D("ProducePlanDetailView");
        $rows = $rowModel->where("ProducePlanDetail.plan_id=".$formData["id"])->select();
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
    
    public function insert() {

        if($_REQUEST["workflow"]) {
            return $this->doWorkflow();
        }
        
        $data = array(
            "start_time"=> strtotime($_POST["startTime"]),
            "end_time"  => strtotime($_POST["endTime"]),
            "type" => $_POST["type"],
            "memo" => $_POST["memo"],
            "total_num" => $_POST["total_num"],
            "create_time"=> CTS
        );
        
        $rows = array();
        $needed = array(
            "goods_id", "num", "version", "standard"
        );
        foreach($_POST["rows"] as $row) {
            $tmp = array();
            if(!checkParamsFull($row, $needed)) {
                continue;
            }
            list($factoryCode, $goods_id, $catid) = explode("_", $row["goods_id"]);
            $tmp["goods_id"] = $row["goods_id"] = $goods_id;
            $tmp["factory_code_all"] = makeFactoryCode($row, $factoryCode);
            $tmp["num"] = $row["num"];
            $tmp["start_time"] = $data["start_time"];
            $tmp["status"] = 0;
            $tmp["memo"] = $row["memo"];
            $tmp["create_time"] = CTS;
            $rows[] = $tmp;
        }
        
        if(!$rows) {
            $this->httpError(500, "fillTheForm");
        }
        
        $data["rows"] = $rows;
        
        $model = D("ProducePlan");
        $id = $model->newPlan($data);
        if(!$id) {
            $this->httpError(500);
        }
        
        import("@.Workflow.Workflow");
        $workflow = new Workflow($this->workflowAlias);
        $workflow->doNext($id, "", true);
    }
    
}
