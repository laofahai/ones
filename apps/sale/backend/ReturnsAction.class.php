<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of OrdersAction
 *
 * @author 志鹏
 */
class ReturnsAction extends CommonAction {
    
    protected $modelName = "Returns";
    
    protected $indexModel = "ReturnsView";

    protected $readModel = "ReturnsView";
    
    protected $modelDetailName = "ReturnsDetail";
    
    protected $mainRowIdField = "returns_id";
    
    protected $workflowAlias = "returns";
    
    protected $relationModel = "Stockin";
    
    protected function _filter(&$map) {
        $map["deleted"] = 0;
    }

    public function read() {
        if(!$_GET["includeRows"] or $_GET['workflow']) {
            return parent::read();
        }

        $formData = parent::read(true);
        $formData["inputTime"] = $formData["dateline"]*1000;

        $rowModel = D("ReturnsDetailView");
        $rows = $rowModel->where("ReturnsDetail.returns_id=".$formData["id"])->select();
//        echo $rowModel->getLastSql();exit;
        $modelIds = array();
        $rowData = array();
        foreach($rows as $v) {
            $tmp = explode(DBC("goods.unique.separator"), $v["factory_code_all"]); //根据factory_code_all factory_code - standard - version
            $factory_code = array_shift($tmp);
            $modelIds = array_merge($modelIds, $tmp);
            $v["modelIds"] = $tmp;
            $v["goods_id"] = sprintf("%s_%s_%s", $factory_code, $v["goods_id"], $v["goods_category_id"]); // factory_code, id, catid
            $v["goods_id_label"] = sprintf("%s",$v["goods_name"]);
            $v["unit_price"] = $v["price"];
            $v["amount"] = $v["num"];
            $rowData[$v["id"]] = $v;
        }
//        array_flip(array_flip($modelIds));

        $formData["customer_id_label"] = $formData["customer"];

        $dataModel = D("DataModelDataView");

        $rowData = $dataModel->assignModelData($rowData, $modelIds);

        $formData["rows"] = reIndex($rowData);


        $this->response($formData);

    }
    
    /**
     * 
     */
    public function insert() {
        $data = $_POST;
        foreach($data["rows"] as $k=>$row) {
            if(!$row or !$row["goods_id"]) {
                unset($data["rows"][$k]);
                continue;
            }
            list($fcCode, $goods_id, $catid) = explode("_", $row["goods_id"]);
            $data["rows"][$k]["goods_id"] = $goods_id;
            $data["rows"][$k]["factory_code_all"] = makeFactoryCode($row, $fcCode);
            
            unset($data["rows"][$k]["standard"]);
            unset($data["rows"][$k]["version"]);
        }
        
        $data["bill_id"] = makeBillCode("ST");
        $data["dateline"] = strtotime($data["inputTime"]);
        $data["saler_id"] = $this->user["id"];
        
        unset($data["customerInfo"]);
        unset($data["discount"]);
        unset($data["inputTime"]);
        
        $model = D("Returns");
        $returnsId = $model->newReturns($data);
//        var_dump($returnsId);exit;
        if(!$returnsId) {
            $this->error($model->getError());
            return;
        }
        
        import("@.Workflow.Workflow");
        $workflow = new Workflow($this->workflowAlias);
        $node = $workflow->doNext($returnsId, "", true);
//        $this->redirect("/JXC/Orders/editDetail/id/".$id);
        
//        $this->success(L("operate_success"));
    }
    
//    public function delete() {
//        if(parent::delete(true)) {
//            $model = D("OrdersDetail");
//            $model->where($map)->delete();
//        }
//    }
            
}

?>
