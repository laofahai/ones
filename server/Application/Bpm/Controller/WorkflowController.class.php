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

    /*
     * 开始执行工作流
     * */
    public function _EM_start_workflow() {
        $workflow_id = I('post.workflow_id');
        $source_module = I('post.source_model');
        $source_id = I('post.source_id');

        $service = D(model_alias_to_name($source_module));
        $source_data = $service->where(['id'=>$source_id])->find();

        if(!$source_data) {
            return;
        }

        $workflow_service = D('Bpm/Workflow');
        $workflow_result = $workflow_service->start_progress($workflow_id, $source_id, $source_data);

        if(false === $workflow_result) {
            $this->error($workflow_service->getError());
            $this->rollback();
            return false;
        }

        $service->where(['id'=>$source_id])->save([
            'workflow_id' => $workflow_id
        ]);
    }

}