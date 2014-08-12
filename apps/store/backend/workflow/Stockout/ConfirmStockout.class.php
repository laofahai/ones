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
        if(!$_REQUEST["donext"]) {
            $data = array(
                "type" => "redirect",
                "location" => sprintf("/doWorkflow/Stockout/confirm/%d/%d", $this->currentNode["id"], $this->mainrowId)
            );
            $this->response($data);
        }
//        echo 123;exit;
        //减少库存
        $data = $_POST["data"];
        $stockout = D("Stockout");
        $detailModel = D("StockoutDetailView");
        $dm = D("StockoutDetail");
        
//        print_r($details);exit;
        $stockout->startTrans();
        
        //更新出库单信息
        $theStockout = $stockout->where("id=".$this->mainrowId)->find();
        $stockout->where("id=".$this->mainrowId)->save(array(
            "memo"   => $data["memo"],
            "status" => 1,
            "outtime" => CTS,
            "stock_manager" => getCurrentUid()
        ));
        //获取当前需要的库存数量
        //减少库存
        $storeProduct = D("StockProductList");
        $success = true;
//        print_r($data["rows"]);exit;
        foreach($data["rows"] as $k=>$v) {
            if(!$v) {
                continue;
            }
            if(!$v["stock"]) {
                Log::write("SQL Error:".$stockout->getLastSql(), Log::SQL);
                $stockout->rollback();
                $this->error("请选择出库仓库");
            }
            $dm->where("id=".$v["id"])->save(array(
                "stock_id" => $v["stock"],
//                "memo"     => $v["memo"],
                "num"      => $v["num"]
            ));
            $storeProduct->where(array(
                "factory_code_all" => $v["factory_code_all"],
                "stock_id" => $v["stock"]
            ))->setDec("num", $v["num"]);
//            echo $storeProduct->getLastSql();exit;
        }
//        if(!$success) {
//            $this->error(sprintf("%s %s %s", $nfFca, $nfName, L("store_num_not_full")));
//        }
        
        //不允许负数库存存在, 库存自动清零
        //@todo 判断库存数量
        if(!DBC("allow_negative_store")) {
            $storeProduct->where("num<0")->save(array(
                "num" => 0
            ));
        }
        $stockout->commit();
        //自动执行外部下一工作流程，查看订单状态
//        import("@.Workflow.Workflow");
        if($this->context["sourceWorkflow"]) {
            $workflow = new Workflow($this->context["sourceWorkflow"], $this->context);
    //        var_dump($workflow);exit;
            $workflow->doNext($theStockout["source_id"], "", true);
        }
        
        
    }
    
}

?>
