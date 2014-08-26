<?php

/**
 * @filename StockTransferMakeStockout.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-12-28  14:13:26
 * @Description
 * 
 */
class StockTransferMakeStockout extends WorkflowAbstract {
    
    public function run() {
        $stockout = D("Stockout");
        $stockoutId = $stockout->makeStockoutPaper("StockTransfer", $this->mainrowId, "user_id", "stock_transfer_id", "outstock_id");
        
//        var_dump($stockoutId);exit;
        
        //流程上下文
        $this->context = array(
            "sourceModel" => "StockTransfer",
            "sourceWorkflow" => "stocktransfer",
            "sourceId" => $this->mainrowId,
            "sourceMainrowField" => "stock_transfer_id"
        );
        
        $this->updateStatus("StockTransfer", $this->mainrowId, 1);
//        $orderModel = D("Orders");
//        $orderModel->where("id=".$this->mainrowId)->save(array("status" => 1));
        
//        print_r($this->context);exit;
        //新建出库工作流
        import("@.Workflow.Workflow");
        $workflow = new Workflow("stockout", $this->context);
        $workflow->doNext($stockoutId, "", true, true);
    }
    
}

?>
