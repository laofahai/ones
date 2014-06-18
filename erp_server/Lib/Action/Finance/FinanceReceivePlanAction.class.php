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

    public function insert() {
        $id = parent::insert(true);

        import("@.Workflow.Workflow");
        $workflow = new Workflow($this->workflowAlias);
        $rs = $workflow->doNext($id, null, false, false);
    }
//
//    public function update() {
//        print_r($_POST);exit;
//    }

}
