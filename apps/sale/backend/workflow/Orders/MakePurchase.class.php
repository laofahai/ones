<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 14/10/31
 * Time: 11:37
 */

class OrdersMakePurchase extends WorkflowAbstract {

    public function run() {

        if(!isAppLoaded("purchase")) {
            $this->error(sprintf(lang("messages.unfoundApp"), "purchase"));
            return;
        }

        //跳转至生成采购单单据
        if(!IS_POST) {
            $this->response(array(
                "type" => "redirect",
                "location" => sprintf("/doWorkflow/orders/makePurchase-Purchase/%d/%d", $this->currentNode["id"], $this->mainrowId)
            ));
        }

        $model = D("Purchase");

        $data = $_POST;

        unset($data["doNext"]);
        unset($data["id"]);

        $data["source_model"] = "Orders";
        $data["source_id"] = $this->mainrowId;

        foreach($data["rows"] as $k=>$row) {
            unset($data["rows"][$k]["id"]);
        }

        $data = $model->formatData($data);

        $purchaseId = $model->newBill($data);

        $thePurchase = $model->find($purchaseId);

        $this->context["memo"] = $thePurchase["bill_id"];

    }

} 