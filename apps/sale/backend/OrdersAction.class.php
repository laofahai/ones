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
class OrdersAction extends CommonAction {
    
    protected $modelName = "Orders";
    
    protected $indexModel = "OrdersView";
    
    protected $modelDetailName = "OrdersDetail";
    
    protected $mainRowIdField = "order_id";
    
    protected $workflowAlias = "orders";
    
    protected $readModel = "OrdersView";
    
    protected $ajaxRowFields = array(
        "factory_code_all"=>"","goods_name"=>"","color_name"=>"",
        "standard_name"=>"", "per_price"=>"input","num"=>"input.",
        "store_num"=>"span.badge badge-info","price"=>"input"
    );
    
    protected $relationModel = "Stockout";
    
    protected function _filter(&$map) {

    }
    
    public function read() {
        
        if(!$_GET["includeRows"] or $_GET['workflow']) {
            return parent::read();
        }
        
        $this->readModel = "OrdersView";
        $formData = parent::read(true);

        $formData["inputTime"] = $formData["dateline"]*1000;
        
        $rowModel = D("OrdersDetailView");
        $rows = $rowModel->where("OrdersDetail.order_id=".$formData["id"])->select();

        $modelIds = array();
        $rowData = array();
        foreach($rows as $v) {
            $tmp = explode(DBC("goods.unique.separator"), $v["factory_code_all"]); //根据factory_code_all factory_code - standard - version
            $factory_code = array_shift($tmp);
            $modelIds = array_merge($modelIds, $tmp);
            
            $v["modelIds"] = $tmp;
            $v["goods_id"] = sprintf("%s_%s_%s", $factory_code, $v["goods_id"], $v["goods_category_id"]); // factory_code, id, catid
            $v["goods_id_label"] = sprintf("%s",$v["goods_name"]);
            $rowData[$v["id"]] = $v;
        }

        $formData["customer_id_label"] = $formData["customer"];
        

        $dataModel = D("DataModelDataView");
        
        $rowData = $dataModel->assignModelData($rowData, $modelIds);
        
        $formData["rows"] = reIndex($rowData);

        /*
         * 相关单据
         * **/
        $relateItem = array();
        $id = abs(intval($_GET["id"]));
        if(isAppLoaded("purchase")) {
            $relateItem = array_merge($relateItem, (array)D("Purchase")->toRelatedItem("Orders", $id));
        }

        if(isAppLoaded("finance")) {
            $relateItem = array_merge($relateItem, (array)D("FinanceReceivePlan")->toRelatedItem("Orders",$id));
        }

        if(isAppLoaded("produce")) {
            $relateItem = array_merge($relateItem, (array)D("ProducePlan")->toRelatedItem("Orders",$id));
        }

        $formData["relatedItems"] = $relateItem;

        $this->response($formData);
        
    }
    
    public function update() {
        $model = D("Orders");
        $theOrder = $model->find($_GET["id"]);

        if($theOrder["status"] >= 1) {
            $this->error("in_workflow");
            return false;
        }

        $data = $model->formatData($_POST);
        if(false === $model->newOrder($data)) {
            $this->error($model->getError());
            return;
        }
    }
    
    
    /**
     * 
     */
    public function insert() {

        if($_REQUEST["workflow"]) {
            return $this->doWorkflow();
        }
        
        $model = D("Orders");
        $data = $model->formatData($_POST);
        $orderId = $model->newOrder($data);
        if(false === $orderId) {
            $this->error($model->getError());
            return;
        }
        
        import("@.Workflow.Workflow");
        $workflow = new Workflow($this->workflowAlias);
        $node = $workflow->doNext($orderId, "", true);
    }

}
