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
        
        //开启财务模块时，自动写入财务收入计划
        if(isModuleEnabled("finance")) {

            $theOrder = $order->find($this->mainrowId);

            $financeModel = D("FinanceReceivePlan");

            $data = array(
                "source_model" => "Orders",
                "source_id" => $this->mainrowId,
                "subject" => "-",
                "customer_id" => $theOrder["customer_id"],
                "amount" => $theOrder["total_amount_real"],
                "type_id" => getTypeIdByAlias("receive", "sale")
            );

            $lastId = $financeModel->record($data);

//            echo $financeModel->getLastSql();exit;
            if(!$lastId) {
                return false;
            }
//            var_dump($node);
        }
//        exit;
//        echo "RequireFinanceVerify";exit;
    }
    
}
