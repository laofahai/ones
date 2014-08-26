<?php

/**
 * @filename CompleteProcess.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-11-30  14:32:37
 * @Description
 * 
 */
class PurchaseCompleteProcess extends WorkflowAbstract {
    
    public function run() {
        $this->updateStatus("Purchase", $this->mainrowId, 2);
        
        //财务
        if(isModuleEnabled("Finance")) {
            
            $purchase = D("Purchase");
            $thePurchase = $purchase->find($this->mainrowId);
//            echo 123;
            $financeModel = D("FinancePayPlan");
            $data = array(
                "source_model" => "Purchase",
                "source_id" => $this->mainrowId,
                "subject" => $thePurchase["subject"],
                "supplier_id" => $thePurchase["supplier_id"],
                "amount" => $thePurchase["total_price_real"],
                "create_dateline" => CTS,
                "status" => 0,
                "type_id" => getTypeIdByAlias("pay", "purchase"),
                "user_id" => getCurrentUid()
            );
            
            $lastId = $financeModel->add($data);
//            echo $lastId;exit;
//            echo $financeModel->getLastSql();exit;
        
            import("@.Workflow.Workflow");
            $workflow = new Workflow("financePay");
            $node = $workflow->doNext($lastId, "", true);
//            var_dump($node);
        }
        
    }
    
}

?>
