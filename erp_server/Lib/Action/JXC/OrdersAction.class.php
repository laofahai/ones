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
    
    protected $ajaxRowFields = array(
        "factory_code_all"=>"","goods_name"=>"","color_name"=>"",
        "standard_name"=>"", "per_price"=>"input","num"=>"input.",
        "store_num"=>"span.badge badge-info","price"=>"input"
    );
    
    protected $relationModel = "Stockout";
    
    protected function _filter(&$map) {
        $map["deleted"] = 0;
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
            $data["rows"][$k]["factory_code_all"] = sprintf("%s-%s-%s", $fcCode, $row["standard"], $row["version"]);
            
            unset($data["rows"][$k]["standard"]);
            unset($data["rows"][$k]["version"]);
        }
        
        $data["bill_id"] = makeBillCode("XS");
        $data["dateline"] = strtotime($data["inputTime"]);
        $data["saler_id"] = $this->user["id"];
        
        unset($data["customerInfo"]);
        unset($data["discount"]);
        unset($data["inputTime"]);
        
        $model = D("Orders");
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

?>
