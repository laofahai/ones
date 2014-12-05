<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of FinancePayPlanAction
 *
 * @author nemo
 */
class FinancePayPlanAction extends CommonAction {
    public $workflowAlias = "financePay";
    protected $indexModel = "FinancePayPlanView";
    protected $readModel = "FinancePayPlanView";

    protected $lockedStatus = 1;

    protected function _filter(&$map) {
        if($_GET["supplier_id"]) {
            $map["supplier_id"] = abs(intval($_GET["supplier_id"]));
        }
        if($_GET["unhandled"]) {
            $map["status"] = array("LT", 2);
        }
    }

    public function insert() {
        $id = parent::insert(true);

        $workflow = new Workflow($this->workflowAlias);
        $workflow->doNext($id, null, false, false);
    }

    public function read() {
        $data = parent::read(true);
        $data["unpayed"] = $data["amount"] - $data["payed"];

        $this->response($data);
    }

}
