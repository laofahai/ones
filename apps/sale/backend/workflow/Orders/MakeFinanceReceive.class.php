<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 14/10/31
 * Time: 11:16
 */

class OrdersMakeFinanceReceive extends WorkflowAbstract {

    public function run() {
        if(!isAppLoaded("finance")) {
            $this->error(sprintf(lang("messages.unfoundApp"), "finance"));
            return;
        }

        if(!IS_POST) {
            $this->leaveMessage();
        }

        $theOrder = D("Orders")->find($this->mainrowId);

        $data = array(
            "subject" => lang("Orders"),
            "type_id" => getTypeIdByAlias("receive", "orders"),
            "customer_id" => $theOrder["customer_id"],
            "source_model"=> "Orders",
            "source_id"   => $this->mainrowId,
            "amount"      => $theOrder["total_amount_real"],
            "memo"        => $_POST["message"]
        );

        $model = D("FinanceReceivePlan");
        $model->record($data);
    }


} 