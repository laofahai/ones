<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 9/14/14
 * Time: 12:56
 */

class CommonBillAction extends CommonAction {

    protected $protectedStatus = 1;

    public function insert() {

        if($_REQUEST["workflow"]) {
            return parent::doWorkflow();
        }

        $model = D($this->getActionName());
        if(!$model->newBill($_POST)) {
            $this->error($model->getError());
        }
    }

    public function update() {

        if($_REQUEST["workflow"]) {
            return parent::doWorkflow();
        }

        $model = D($this->getActionName());

        $sourceData = $model->find($_POST["id"]);
        if($sourceData["status"] >= $this->protectedStatus) {
            $this->error("in_workflow");
            return;
        }

        if(!$model->editBill($_POST)) {
            $this->error($model->getError());
        }
    }

}