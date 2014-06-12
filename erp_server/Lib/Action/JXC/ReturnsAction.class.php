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
    
    protected $modelDetailName = "ReturnsDetail";
    
    protected $mainRowIdField = "returns_id";
    
    protected $workflowAlias = "returns";
    
    protected $relationModel = "Stockin";
    
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
