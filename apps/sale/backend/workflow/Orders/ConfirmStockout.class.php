<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of ConfirmStockout
 *
 * @author 志鹏
 */
class OrdersConfirmStockout extends WorkflowAbstract {
    
    /**
     * 1、修改库存数量  判断库存数量
     * 2、修改出库单状态
     */
    public function run() {
        return false; //已切换至出库工作流
        if(!IS_POST) {
            $map = array(
                "source_id" => $this->mainrowId,
                "source_model" => "Orders"
            );
            $p = D("Stockout")->where($map)->find();
            
            $viewModel = D("StockoutOrdersRelation");
            $thePaper = $viewModel->relation(true)->find($id);
            
            $paperDetail = D("Stockout".$thePaper["source_model"]."DetailView");
            $thePaperDetail = $paperDetail->where("StockoutDetail.stockout_id=".$thePaper["id"])->select();

            $this->view->assign("lang_title", "confirm_stockout");
            $this->view->assign("list", $thePaperDetail);
            $this->view->assign("thePaper", $thePaper);
            $this->view->display("../Common/Workflow/Order/confirmStockout");

            return "wait";
        }
        $ordersDetail = D("OrdersDetailView");
        $details = $ordersDetail->where("order_id=".$this->mainrowId)->select();
//        echo $ordersDetail->getLastSql();exit;
        if(!$details) {
            echo "nothings";exit;
            //@todo 单据中无数据
        }
        
        $stockout = D("Stockout");
        $theStockout = $stockout->where("source_id=".$this->mainrowId)->find();
        $stockout->where("id=".$theStockout["id"])->save(array(
            "status" => 1,
            "outtime" => CTS,
            "stock_manager" => getCurrentUid()
        )); //@todo 
//        echo $stockout->getLastSql();exit;
        $stockout->startTrans();
        
        $storeProduct = D("StockProductList");
        $success = true;
        foreach($details as $k=>$v) {
            if($v["store_num"] < $v["num"]) {
                $success = false;
                Log::write("SQL Error:".$this->getLastSql(), Log::SQL);
                $stockout->rollback();
                //@todo 库存不足
                echo "not_full";exit;
                break;
            }
            
            $storeProduct->where("id=".$v["stock_product_id"])->setDec("num", $v["num"]);
        }
        if($success) {
            $stockout->commit();
        } 
        
        
//        exit;
    }
    
}

?>
