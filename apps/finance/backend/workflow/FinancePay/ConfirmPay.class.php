<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 14/11/18
 * Time: 14:02
 */

class FinancePayConfirmPay extends WorkflowAbstract {

    public function run() {

        $model = D("FinancePayPlan");
        $plan = $model->find($this->mainrowId);

        if($plan["payed"] >= $plan["amount"]) {
            $this->response(array(
                "type" => "message",
                "error"=> "true",
                "msg"  => "all_money_has_payed"
            ));return;
        }

        if(!IS_POST) {
            $this->response(array(
                "type" => "redirect",
                "location" => sprintf("/doWorkflow/FinancePayPlan/confirm/%d/%d", $this->currentNode["id"], $this->mainrowId)
            ));
        }

        $accountId = $plan["account_id"] ? $plan["account_id"] : abs(intval($_POST["account_id"]));
        if(!$accountId) {
            $this->error("params_error");
        }

        $amount = $_POST["unpayed"];

        $data = array(
            "account_id" => $accountId,
            "amount" => $amount,
            "type" => 2,
            "type_id" => $plan["type_id"]
        );
        $recordModel = D("FinanceRecord");
        $recordId = $recordModel->addRecord($data);

        $data = array(
            "payed" => $plan["payed"]+$amount
        );

        $allPayed = $plan["payed"]+$amount >= $plan["amount"];

        if($allPayed) {
            $data["status"] = 2;
            $data["pay_dateline"] = CTS;
        } else {
            $data["status"] = 1;
        }

        $model->where(array("id=".$this->mainrowId))->save($data);

        $account = D("FinanceAccount")->find($accountId);

        $this->context["memo"] = $account["name"].": ".$amount;
    }

} 