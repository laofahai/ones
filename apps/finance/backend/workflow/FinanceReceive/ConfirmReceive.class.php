<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 14/11/18
 * Time: 11:29
 */

class FinanceReceiveConfirmReceive extends WorkflowAbstract {

    public function run() {

        $model = D("FinanceReceivePlan");
        $plan = $model->find($this->mainrowId);

        if($plan["received"] >= $plan["amount"]) {
            $this->response(array(
                "type" => "message",
                "error"=> "true",
                "msg"  => "all_money_has_received"
            ));return;
        }

        if(!IS_POST) {
            $this->response(array(
                "type" => "redirect",
                "location" => sprintf("/doWorkflow/FinanceReceivePlan/confirm/%d/%d", $this->currentNode["id"], $this->mainrowId)
            ));
        }

        $accountId = $plan["account_id"] ? $plan["account_id"] : abs(intval($_POST["account_id"]));
        if(!$accountId) {
            $this->error("params_error");
        }

        $amount = $_POST["unreceived"];

        $data = array(
            "account_id" => $accountId,
            "amount" => $amount,
            "type" => 1,
            "type_id" => $plan["type_id"]
        );
        $recordModel = D("FinanceRecord");
        $recordId = $recordModel->addRecord($data);

        $data = array(
            "received" => $plan["received"]+$amount
        );

        $allReceived = $plan["received"]+$amount >= $plan["amount"];

        if($allReceived) {
            $data["status"] = 2;
            $data["receive_dateline"] = CTS;
        } else {
            $data["status"] = 1;
        }

        $model->where(array("id=".$this->mainrowId))->save($data);

        $account = D("FinanceAccount")->find($accountId);

        $this->context["memo"] = $account["name"].": ".$amount;
    }

} 