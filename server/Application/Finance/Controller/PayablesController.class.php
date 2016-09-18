<?php

/*
 * @app Finance
 * @package Finance.controller.Payables
 * @author laofahai@TEam Swift
 * @link http://ng-erp.com
 * */
namespace Finance\Controller;
use Common\Controller\BaseRestController;

class PayablesController extends BaseRestController {

    protected function _filter(&$map) {}

    public function _after_insert($id) {

        if(!$id) {
            return;
        }

        $workflow_service = D('Bpm/Workflow');
        if(false === $workflow_service->start_progress(I('post.workflow_id'), $id, [])) {
            $this->error($workflow_service->getError());
            return false;
        }
    }

}