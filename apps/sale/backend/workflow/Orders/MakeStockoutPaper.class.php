<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of MakeStockoutPaper
 *
 * @author 志鹏
 */
class OrdersMakeStockoutPaper extends WorkflowAbstract {
    
    public function run() {
        $stockout = D("Stockout");
        $stockoutId = $stockout->makeStockoutPaper("Orders", $this->mainrowId, "saler_id", "order_id");
        
        //流程上下文
        $this->context = array(
            "sourceModel" => "Orders",
            "sourceWorkflow" => "orders",
            "sourceId" => $this->mainrowId,
            "sourceMainrowField" => "order_id"
        );
        
        $this->updateStatus("Orders", $this->mainrowId, 1);
//        $orderModel = D("Orders");
//        $orderModel->where("id=".$this->mainrowId)->save(array("status" => 1));
        
//        print_r($this->context);exit;
        //新建出库工作流
        import("@.Workflow.Workflow");
        $workflow = new Workflow("stockout", $this->context);
        $workflow->doNext($stockoutId, "", true, true);
    }


    public function IsMaked () {
        $model = D("Stockout");
        $map = array(
            "source_model" => "Orders",
            "source_id"    => $this->mainrowId
        );
        if($model->where($map)->find()){
            $this->error = "stockout already maked";
            return false;
        } else {
            return true;
        }
    }
    
}

?>
