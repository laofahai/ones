<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of FinanceReceivePlanAction
 *
 * @author nemo
 */
class FinanceReceivePlanAction extends CommonAction {

    public $workflowAlias = "financeReceive";
    protected $indexModel = "FinanceReceivePlanView";
    protected $readModel = "FinanceReceivePlanView";

    protected $lockedStatus = 1;

    protected function _filter(&$map) {
        if($_GET["customer_id"]) {
            $map["customer_id"] = abs(intval($_GET["customer_id"]));
        }
        if($_GET["unhandled"]) {
            $map["status"] = array("LT", 2);
        }
    }

    protected function pretreatment() {
        if($_POST["customer_name"]) {
            $_POST["customer_id"] = $_POST["customer_name"];
        }
    }

    public function insert() {
        $id = parent::insert(true);

        import("@.Workflow.Workflow");
        $workflow = new Workflow($this->workflowAlias);
        $rs = $workflow->doNext($id, null, false, false);
    }

    public function read() {
        $data = parent::read(true);
        $data["unreceived"] = $data["amount"] - $data["received"];

        $this->response($data);
    }


//
//    public function update() {
//        print_r($_POST);exit;
//    }

}
