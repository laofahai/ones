<?php

/**
 * @filename ConfirmStockin.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-11-17  9:14:38
 * @Description
 * 
 */
class StockinConfirmStockin extends WorkflowAbstract {
    
    /**
     * @todo 更新仓库总量
     */
    public function run() {
        //显示确认页面
        if(!$_POST["donext"]) {
            $data = array(
                "type" => "redirect",
                "location" => sprintf("/doWorkflow/Stockin/confirm/%d/%d", $this->currentNode["id"], $this->mainrowId)
            );
            $this->response($data);
        }
        
        $id = $this->mainrowId;
        
        if(!$id) {
            $this->error(L("params_error"));
        }
        
        $map = array(
            "stockin_id" => $id
        );
        
        $stockinDetailView = D("StockinDetailView");
        $data = $stockinDetailView->where($map)->select();
        
        $stockin = D("Stockin");
        $theStockin = $stockin->find($id);
        $stockProductListModel = D("StockProductList");
        $stockProductListModel->startTrans();
        $rs = $stockProductListModel->updateStoreList($data);
        if(true === $rs) {
            $stockProductListModel->commit();
            $data = array(
                "status" => 2,
                "stock_manager" => getCurrentUid()
            );
            $stockin->where("id=".$id)->save($data);
            $this->updateStatus("Stockin", $id, 2);
        } else {
            $stockProductListModel->rollback();
            $this->error(L("operate_failed"));
//            $this->action->error(L("operate_failed"));
        }
        //若外部生成，走外部下一流程
        if($theStockin["source_model"]) {
            import("@.Workflow.Workflow");
            $workflow = new Workflow(strtolower($theStockin["source_model"]), $this->action);
            $node = $workflow->doNext($theStockin["source_id"], "", true, true);
        }
    }
    
    public function checkStockManger($condition) {
        return true;
        $stockIn = D("Stockin")->find($this->mainrowId);
        $managers = D("Stock")->where("id=".$stockIn["stock_id"])->getField("managers");
        
        return inExplodeArray(getCurrentUid(), $managers);
    }
    
}

?>
