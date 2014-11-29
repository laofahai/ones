<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 14/11/18
 * Time: 09:29
 */

class PurchaseMakeFinancePay extends WorkflowAbstract {

    public function run() {

        $thePurchase = D("Purchase")->find($this->mainrowId);

        if(!$thePurchase) {
            $this->error("not_found");exit;
        }

        if(!isset($_POST["message"])) {
            $this->leaveMessage();
            exit;
        }

        $this->context["memo"] = $_POST["message"];

        $financePay = D("FinancePayPlan");

        $data = array(
            "subject" => lang("Purchase"),
            "type_id" => getTypeIdByAlias("receive", "purchase"),
            "supplier_id" => $thePurchase["supplier_id"],
            "source_model"=> "Purchase",
            "source_id"   => $this->mainrowId,
            "amount"      => $thePurchase["total_amount_real"],
            "memo"        => $_POST["message"]
        );
        $financePay->record($data);

    }

} 