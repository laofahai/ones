<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 7/5/15
 * Time: 21:23
 */

namespace Bpm\Controller;


use Common\Controller\BaseRestController;

class WorkflowController extends BaseRestController {

    /*
     * 获取工作流全部信息，包括工作流基本信息和其节点信息
     * */
    public function _EM_get_full_data() {
        $data = D('Bpm/Workflow')->to_language(I('get.id'));
        $this->response(['workflow'=>$data]);
    }

    /*
     * 工作流POST提交
     * */
    public function _EM_node_post() {
        $source_id = I('get.source_id');
        $node_id   = I('get.node_id');
        $workflow = D('Bpm/Workflow');

        $node = D('Bpm/WorkflowNode')->where(['id'=>$node_id])->find();

        $result = $workflow->exec($node['workflow_id'], $source_id, $node_id);

        if(false === $result) {
            $this->error($workflow->getError());
        }
    }

}