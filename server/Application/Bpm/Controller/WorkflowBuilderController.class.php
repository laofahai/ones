<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 7/6/15
 * Time: 19:54
 */

namespace Bpm\Controller;


use Common\Controller\BaseRestController;
use Common\Model\CommonModel;

class WorkflowBuilderController extends BaseRestController {

    public function on_put() {
        $service = D('Bpm/Workflow');
        if(false === $service->save_workflow(I('post.data'), I('post.id'))) {
            $this->error('E: '.$service->getError());
        } else {
            $this->success(__('common.Operation Success'));
        }
    }

}