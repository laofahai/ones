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
    
    protected $workflowAlias = "order";
    
    protected $readModel = "OrdersView";
    
    protected $ajaxRowFields = array(
        "factory_code_all"=>"","goods_name"=>"","color_name"=>"",
        "standard_name"=>"", "per_price"=>"input","num"=>"input.",
        "store_num"=>"span.badge badge-info","price"=>"input"
    );
    
    protected $relationModel = "Stockout";
    
    protected function _filter(&$map) {
        $map["deleted"] = 0;
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
//        echo $rowModel->getLastSql();exit;
        $modelIds = array();
        $rowData = array();
        foreach($rows as $v) {
            $tmp = explode("-", $v["factory_code_all"]); //根据factory_code_all factory_code - standard - version
            $factory_code = array_shift($tmp);
            $modelIds = array_merge($modelIds, $tmp);
            
            $v["modelIds"] = $tmp;
            $v["goods_id"] = sprintf("%s_%s_%s", $factory_code, $v["goods_id"], $v["goods_category_id"]); // factory_code, id, catid
            $v["goods_id_label"] = sprintf("%s",$v["goods_name"]);
            $rowData[$v["id"]] = $v;
        }
//        array_flip(array_flip($modelIds));
        
        $formData["customer_id_label"] = $formData["customer"];

        $params = array(
            $rowData, $modelIds
        );
        tag("assign_dataModel_data", $params);
        
        $formData["rows"] = reIndex($params[0]);
        $this->response($formData);
        
    }
    
    public function update() {
        $model = D("Orders");
        $data = $model->formatData($_POST);
        $orderId = $model->newOrder($data);
    }
    
    
    /**
     * 
     */
    public function insert() {
        
        $model = D("Orders");
        $data = $model->formatData($_POST);
        $orderId = $model->newOrder($data);
        if(!$orderId) {
            $this->error($model->getError());
        }
        
        import("@.Workflow.Workflow");
        $workflow = new Workflow($this->workflowAlias);
        $node = $workflow->doNext($orderId, "", true);
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
