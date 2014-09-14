<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 9/14/14
 * Time: 12:56
 */

class CommonBillAction extends CommonAction {

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
        if(!$model->editBill($_POST)) {
            $this->error($model->getError());
        }
    }

}