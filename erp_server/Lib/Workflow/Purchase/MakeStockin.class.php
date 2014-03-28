<?php

/**
 * @filename MakeStockin.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-11-30  14:08:05
 * @Description
 * 
 */
class PurchaseMakeStockin extends WorkflowAbstract {
    
    public function run() {
        $purchase = D("Purchase");
        $thePurchase = $purchase->find($this->mainrowId);
        $purchaseDetail = D("PurchaseDetail");
        $thePurchaseDetail = $purchaseDetail->where("purchase_id=".$thePurchase["id"])->select();
        
//        $purchase->startTrans();
        $data = array(
            "subject" => $thePurchase["subject"],
            "dateline"=> CTS,
            "total_num" => $thePurchase["total_num"],
            "status"  => 1,
            "user_id" => getCurrentUid(),
            "source_model" => "Purchase",
            "source_id"    => $this->mainrowId,
            "stock_manager"=> 0,
            "stock_id"     => $thePurchase["stock_id"],
            "memo" => $thePurchase["memo"]
        );
        
        $stockin = D("Stockin");
        $stockinDetail = D("StockinDetail");
        
        $lastId = $stockin->add($data);
//        echo $lastId;exit;
//        var_dump($thePurchaseDetail);exit;
        foreach($thePurchaseDetail as $trd) {
            $data = array(
                "stockin_id" => $lastId,
                "goods_id"   => $trd["goods_id"],
                "color_id"   => $trd["color_id"],
                "standard_id"=> $trd["standard_id"],
                "num"        => $trd["num"],
                "factory_code_all" => $trd["factory_code_all"]
            );
//            print_r($data);exit;
            $stockinDetail->add($data);
            
        }
        
        //新建入库流程
        import("@.Workflow.Workflow");
        $workflow = new Workflow("stockin", $this->action);
        $rs = $workflow->doNext($lastId, "", true, true); //新建
//        $rs = $workflow->doNext($lastId, "", true, true); //保存
//        $rs = $workflow->doNext($lastId, "", true, true); //提交确认
//        var_dump($rs);exit;
        
        
        
//        exit;
    }
    
}

?>
