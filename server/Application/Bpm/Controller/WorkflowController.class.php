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
        $data = D('Bpm/Workflow')->get_workflow(I('get.id'));
        $raw_nodes = $data['nodes'];

        foreach($raw_nodes as $k=>$v) {
            $nodes[] = unserialize($v['widget_config']);
        }

        $nodes = get_array_by_group($data['nodes'], 'executor');

        $group = [];
        foreach($nodes as $executor => $nodes_array) {
            $group[$executor]['group'] = [
                'value' => $executor
            ];

            foreach($nodes_array as $k=>$node) {
                $nodes_array[$k]['type'] = $node['node_type'];
                unset($nodes_array[$k]['node_type']);

                $nodes_array[$k] = array_merge($node, (array)unserialize($node['widget_config']));

                $nodes_array[$k]['widget_id'] = (int)$node['widget_id'];
                $nodes_array[$k]['id'] = (int)$node['widget_id'];
                $nodes_array[$k]['workflow_id'] = (int)$node['workflow_id'];
            }

            $group[$executor]['widgets'] = $nodes_array;
        }

        $data['nodes'] = $group;
        $this->response($data);
    }

    /*
     * 工作流POST提交
     * */
    public function _EM_node_post() {
        $source_id = I('get.source_id');
        $node_id   = I('get.node_id');
        $workflow = D('Bpm/Workflow');
        $result = $workflow->exec($source_id, [], $node_id);
        if(false === $result) {
            $this->error($workflow->getError());
        }
    }



}