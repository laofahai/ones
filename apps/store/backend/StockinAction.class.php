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

        $formDatas = parent::read(true);
        $rowModel = D("StockinDetailView");

        if($formDatas["id"]) {
            $isSingle = true;
            $formDatas = array($formDatas);
        }

        foreach($formDatas as $id=>$formData) {

            $formData["dateline"] *= 1000;
            $formData["stock_manager"] = toTruename($formData["stock_manager"]);

            $rows = $rowModel->where("StockinDetail.stockin_id=".$formData["id"])->select();
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
                $v["total_num"] = $v["num"];
                $v["num"] = $v["num"] - $v["ined"];
                $rowData[$v["id"]] = $v;
            }

            $params = array(
                $rowData, $modelIds
            );
            tag("assign_dataModel_data", $params);

            $formData["rows"] = reIndex($params[0]);

            if($formData["source_model"] && $formData["source_id"]) {
                $sourceModel = D($formData["source_model"]."View");
                $formData["source"] = $sourceModel->find($formData["source_id"]);

                if($_GET["includeRelated"]) {
                    try {
                        $model = D($formData["source_model"]);
                        $related = $model->getRelatedItem($formData["source_id"]);
                        $formData["relatedItems"][] = $related;
                    } catch(Exception $e) {}

                    if($_GET["includeSourceRows"]) {
                        $model = D($formData["source_model"]."DetailView");
                        $foreignKey = $model->foreignKey ? $model->foreignKey : lcfirst($formData["source_model"])."_id";
                        $map[$foreignKey] = $formData["source_id"];
                        $formData["source_detail"] = $model->where($map)->select();
                    }
                }
            }

            $results[] = $formData;
        }


        if($isSingle) {
            $this->response($formData);
            return;
        }

        $response = array(
            "count" => count($results),
            "datas" => $results
        );

        $this->response($response);
        
    }
    
    public function update() {
        $id = abs(intval($_GET["id"]));
        $model = D("Stockin");
        $data = $model->find($id);
        if($data["status"] > 0) {
            $this->error("in_workflow");
            return false;
        }
        
        list($bill, $rows) = $model->formatData($_POST);

        if(!$model->editBill($bill, $rows)) {
            $this->error($model->getError());
        }
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

        if(!$stockinModel->newBill($bill, $rows)) {
            $this->error($stockinModel->getError());
        }
        
    }
    
}
