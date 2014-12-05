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
    
    public $workflowAlias = "producePlan";
    
    protected $indexModel = "ProducePlanView";
    
    public function read() {
        if(!$_GET["includeRows"] or $_GET['workflow']) {
            return parent::read();
        }
        
        $formData = parent::read(true);
        $formData["start_time"] = $formData["start_time"]*1000;
        $formData["end_time"] = $formData["end_time"]*1000;
        
        $rowModel = D("ProducePlanDetailView");
        $rows = $rowModel->where("ProducePlanDetail.plan_id=".$formData["id"])->select();
//        echo $rowModel->getLastSql();exit;
        $modelIds = array();
        $rowData = array();
        foreach($rows as $v) {
            $tmp = explode(DBC("goods.unique.separator"), $v["factory_code_all"]); //根据factory_code_all factory_code - standard - version
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

        $params = array(
            $rowData, $modelIds
        );
        tag("assign_dataModel_data", $params);
        
        
        $formData["rows"] = reIndex($params[0]);
        
        
        $this->response($formData);
    }
    
    public function insert() {

        if($_REQUEST["workflow"]) {
            return $this->doWorkflow();
        }

        $model = D("ProducePlan");
        $data = $model->formatData($_POST);
        
        if(!$data) {
            $this->httpError(500, $model->getError());
        }
        
        $id = $model->newPlan($data);

        if(!$id) {
            $this->httpError(500, $model->getError());
        }
        
    }

    public function update() {
        $model = D("ProducePlan");
        $data = $model->formatData($_POST);

        if(!$data) {

            $this->httpError(500, $model->getError());
        }

        $id = $model->editPlan($data);

        if(!$id) {
            $this->httpError(500, $model->getError());
        }
    }
    
}
