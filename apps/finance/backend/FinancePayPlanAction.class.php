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

    public function insert() {
        $id = parent::insert(true);

        $workflow = new Workflow($this->workflowAlias);
        $workflow->doNext($id, null, false, false);
    }
}
