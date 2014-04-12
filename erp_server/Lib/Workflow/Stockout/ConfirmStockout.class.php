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
class StockoutConfirmStockout extends WorkflowAbstract {
    
    /**
     * 1、修改库存数量  判断库存数量
     * 2、修改出库单状态
     */
    public function run() {
        if(!IS_POST) {
            $data = array(
                "type" => "redirect",
                "location" => "/doWorkflow/Stockout/confirm/".$this->mainrowId
            );
            echo json_encode($data);
//            $map = array(
//                "source_id" => $this->context['sourceId'],
//                "source_model" => $this->context['sourceModel']
//            );
//            $theStockout = D("Stockout")->where($map)->find();
//            $viewModel = D("Stockout{$this->context['sourceModel']}Relation");
//            $thePaper = $viewModel->relation(true)->find($this->mainrowId);
////            print_r($thePaper);exit;
//            $paperDetail = D("Stockout".$thePaper["source_model"]."DetailView");
//            $thePaperDetail = $paperDetail->where("StockoutDetail.stockout_id=".$this->mainrowId)->group("StockoutDetail.id")->select();
////            echo $paperDetail->getLastSql();exit;
//
//            $this->view->assign("lang_title", "confirm_stockout");
//            $this->view->assign("list", $thePaperDetail);
//            $this->view->assign("thePaper", $thePaper);
//            $this->view->display("../Common/Workflow/Stockout/confirmStockout");

            return "wait";
        }
        
        $sourceDetail = D($this->context['sourceModel']."DetailView");
        $details = $sourceDetail->where($this->context['sourceMainrowField']."=".$this->context['sourceId'])->select();
        if(!$details) {
            echo "nothings";exit;
            //@todo 单据中无数据
        }
        
        $stockout = D("Stockout");
        $theStockout = $stockout->where("id=".$this->mainrowId)->find();
        $stockout->where("id=".$this->mainrowId)->save(array(
            "status" => 1,
            "outtime" => CTS,
            "stock_manager" => getCurrentUid()
        )); //@todo 
//        echo $stockout->getLastSql();exit;
        $stockout->startTrans();
        //减少库存
        $storeProduct = D("StockProductList");
        $success = true;
        foreach($details as $k=>$v) {
            if($v["store_num"] < $v["num"]) {
                $success = false;
                $stockout->rollback();
                //@todo 库存不足
                //echo "not_full";exit;
                break;
            }
            
            $storeProduct->where("id=".$v["stock_product_id"])->setDec("num", $v["num"]);
        }
        if($success) {
            $stockout->commit();
        } 
        //进行订单流程，查看订单状态
//        import("@.Workflow.Workflow");
        $workflow = new Workflow($this->context["sourceWorkflow"], $this->context);
//        var_dump($workflow);exit;
        $workflow->doNext($theStockout["source_id"], "", true);
    }
    
}

?>
