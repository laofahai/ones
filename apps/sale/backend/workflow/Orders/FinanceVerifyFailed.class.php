<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of FinanceVerifyFailed
 *
 * @author 志鹏
 */
class OrdersFinanceVerifyFailed extends WorkflowAbstract {
    
    public function run() {
        $order = D("Order");
        $data = array(
            "id" => $this->mainrowId,
            "status" => 0
        );
        $order->save($data);
//        echo "RequireFinanceVerify";exit;
        $this->context = "reject=1";
        return true;
    }
    
}
