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
        // 提交的源数据
        $source_data = I('post.');

        $workflow_id = I('get.id');

        $workflow_model = D('Bpm/Workflow');
        $workflow = $workflow_model->where(array('id'=>$workflow_id))->find();

        if(!$workflow) {
            $error = $workflow_model->getError();
            $error = $error ? $error : __(CommonModel::MSG_NOT_FOUND);
            $this->error($error);
        }

        $node_service = D('Bpm/WorkflowNode');

        // 删除原数据
        $node_service->where(['workflow_id'=>$workflow_id])->delete();

        $id_map = [];
        $node_ids = [];
        foreach($source_data as $group_value => $data) {
            $nodes = $data['widgets'];

            foreach($nodes as $node) {
                $node_data = [];

                $node_data['label'] = $node['label'];
                $node_data['node_type'] = $node['type'];
                $node_data['action_type'] = $node['action_type'];

                switch($node['action_type']) {
                    case "n":
                        break;
                    case "e": //service api
                        $node_data['action'] = $node['service_api'];
                        break;
                    case "u": // 修改源数据
                        $node_data['action'] = $node['edit_source_config'];
                        break;
                }

                // 执行者
                $node_data['executor'] = $group_value;

                $node_data['workflow_id'] = $workflow_id;
                $node_data['company_id'] = get_current_company_id();

                // 提醒
                $node_data['notify'] = $node['notify'];
                $node_data['notify_content'] = $node['notify_content'];

                $node_data['widget_id'] = $node['id'];
                $node_data['widget_config'] = serialize($node);


                if(!$node_service->create($node_data)) {
                    return $this->error($node_service->getError());
                }

                $node_id = $node_service->add();

                /*
                 * 关联本表
                 * */
                $id_map[$node['id']] = [
                    'node_id' => $node_id,
                    'relation'=> [
                        'prev_nodes' => $node['prev_node_ids'],
                        'next_nodes' => $node['next_node_ids'],
                        'condition_true_nodes' => $node['condition_true_ids'],
                        'condition_false_nodes' => $node['condition_false_ids']
                    ]
                ];

                array_push($node_ids, $node_id);
            }
        }


        /*
         * 获取新近插入的节点
         * */
        $all_nodes = $node_service->where(array(
            'id' => ['IN', $node_ids]
        ))->select();

        $all_nodes_map = get_array_to_kv($all_nodes, 'id', 'widget_id');


        foreach($id_map as $widget_id=>$item) {
            $map = [
                'id' => $item['node_id'],
                'widget_id' => $widget_id
            ];

            $save_data = [];
            foreach($item['relation'] as $relation_field => $relation_ids) {
                $relation_ids = array_unique($relation_ids);
                foreach($relation_ids as $relation_id) {
                    $save_data[$relation_field][] = $all_nodes_map[$relation_id];
                }
                $save_data[$relation_field] = implode(',', $save_data[$relation_field]);
            }

            $node_service->where($map)->save($save_data);
        }

    }

}