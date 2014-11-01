<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 14/11/1
 * Time: 17:48
 */

class OrdersMakeProducePlan extends WorkflowAbstract {

    public function run() {

        if(!isAppLoaded("produce")) {
            $this->error(sprintf(lang("messages.unfoundApp"), "produce"));
            return;
        }

        if(!IS_POST) {
            $this->response(array(
                "type" => "redirect",
                "location" => sprintf("/doWorkflow/orders/makeProduce-ProducePlan/%d/%d", $this->currentNode["id"], $this->mainrowId)
            ));
        }

        exit;

    }

} 