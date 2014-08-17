<?php

/**
 * @filename RequireFinanceVerify.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-11-15  9:23:51
 * @Description
 * 
 */
class OrdersRequireFinanceVerify extends WorkflowAbstract {
    
    /**
     * 提交财务审核
     */
    public function run() {
        $order = D("Orders");
        $data = array(
            "id" => $this->mainrowId,
            "status" => 1
        );
        $order->save($data);
        
        //财务
        if(isModuleEnabled("Finance")) {
            $financeModel = D("FinanceReceivePlan");
            $theOrder = $order->find($this->mainrowId);
            $data = array(
                "source_model" => "Orders",
                "source_id" => $this->mainrowId,
                "subject" => "",
                "customer_id" => $theOrder["customer_id"],
                "amount" => $theOrder["total_amount_real"],
                "create_dateline" => CTS,
                "status" => 0,
                "type_id" => getTypeIdByAlias("receive", "sale"),
                "user_id" => getCurrentUid()
            );
            
            $lastId = $financeModel->add($data);

//            echo $financeModel->getLastSql();exit;
            if(!$lastId) {
                return false;
            }
            import("@.Workflow.Workflow");
            $workflow = new Workflow("financeReceive");
            $node = $workflow->doNext($lastId, "", true);
//            var_dump($node);
        }
//        exit;
//        echo "RequireFinanceVerify";exit;
    }
    
}
