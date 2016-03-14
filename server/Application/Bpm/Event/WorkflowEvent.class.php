<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 7/15/15
 * Time: 22:22
 */

namespace Bpm\Event;


use Common\Event\BaseRestEvent;

class WorkflowEvent extends BaseRestEvent {

    /*
     * 「扩展方法」
     * 获取当前数据在工作流中的下一节点
     * */
    public function _EM_get_next_nodes() {
        $workflow_id = I('get.workflow_id');
        $source_id   = I('get.source_id');

        $check_permission = true;
        $next_nodes = D('Bpm/Workflow')->get_next_nodes_by_source($workflow_id, $source_id, true);

        $fields = explode(',', I('get._fd'));
        if($fields) {
            foreach($next_nodes as $k=>$node) {
                $next_nodes[$k] = filter_array_fields($node, $fields);
            }
        }

        $this->response($next_nodes, 'workflow_node', true);
    }

    /*
     * 「扩展方法」
     * 获取当前数据的工作流进程
     * */
    public function _EM_get_progress() {
        $workflow_id = I('get.workflow_id');
        $source_id   = I('get.source_id');

        $source_module = I('get.module');
        $progresses = D('Bpm/WorkflowProgress')->get_progress($workflow_id, $source_id, true, $source_module);
        $this->response($progresses, 'workflow_progress', true);
    }

    /*
     * 「扩展方法」
     * 执行工作流节点
     * */
    public function _EM_execute_node() {

        $source_id = I('get.source_id');
        $node_id   = I('get.node_id');

        $node = D('Bpm/WorkflowNode')->where(['id'=>$node_id])->find();

        $workflow = D('Bpm/Workflow');
        $result = $workflow->exec($node['workflow_id'], $source_id, $node_id);
        if(false === $result) {
            $this->error($workflow->getError());
        }
    }

    /*
     * 「扩展方法」
     * 获得可新增的角色、部门、用户
     * */
    public function _EM_get_addable_roles() {
        $response_data = [
            'users' => [],
            'departments' => [],
            'roles' => []
        ];

        $users = D('Account/UserInfo')->where([])->select();
        $response_data['users'] = filter_array_fields_multi((array)$users, ['id', 'realname']);

        $departments = D('Account/Department')->get_tree();
        $response_data['departments'] = filter_array_fields_multi((array)$departments, ['id', 'name']);

        $roles = D('Account/AuthRole')->where([])->select();
        $response_data['roles'] = filter_array_fields_multi((array)$roles, ['id', 'name']);

        foreach($response_data as $r=>$items) {
            foreach($items as $k=>$v) {
                $response_data[$r][$k]['id'] = (int)$v['id'];
            }
        }

        $this->response($response_data);
    }

}