<?php

/*
 * @app Bpm
 * @package Bpm.service.WorkflowProgress
 * @author laofahai@TEam Swift
 * @link http://ng-erp.com
 * */
namespace Bpm\Service;
use Common\Model\CommonModel;

class WorkflowProgressService extends CommonModel {

    protected $_auto = array(
        array("user_info_id", "get_current_user_id", 1, "function"),
        array("company_id", "get_current_company_id", 1, "function")
    );

    /*
     * 返回数据的所有工作流历史进度
     *
     * @param integer $workflow_id 工作流ID
     * @param integer $source_id 原始数据ID
     * @param boolean $include_related 是否包含相关单据的工作流
     * @param string $source_module_alias 源模块别名
     * */
    public function get_progress($workflow_id, $source_id, $include_related=false, $source_module_alias=null) {

        $map = [];
        $where_template = 'WorkflowProgress.workflow_id=%d AND WorkflowProgress.source_id=%d';
        $where = [
            '_logic' => 'OR'
        ];

        array_push($where,
            sprintf($where_template, $workflow_id, $source_id)
        );

        if($include_related && $source_module_alias) {

            $source_service = D(model_alias_to_name($source_module_alias));
            $source_data = $source_service->where(['id'=>$source_id])->find();

            // 包含source_model 和 source_id情况
            if($source_data['source_model'] && $source_data['source_id']) {
                $source_source_service = D(model_alias_to_name($source_data['source_model']));
                $source_source_workflow_id = $source_source_service->where(['id'=>$source_data['source_id']])->getField('workflow_id');
                array_push($where,
                    sprintf($where_template, $source_source_workflow_id, $source_data['source_id'])
                );
            }


            // 包含相关单据情况
            if($source_service->related_module) {
                foreach($source_service->related_module as $rm) {
                    $related_service = D(model_alias_to_name($rm));
                    $related_bills = $related_service->where([
                        'source_model' => $source_module_alias,
                        'source_id' => $source_id
                    ])->select();

                    foreach($related_bills as $rb) {
                        array_push($where,
                            sprintf($where_template, $rb['workflow_id'], $rb['id'])
                        );
                    }
                }
            }
        }

        $map['_complex'] = $where;

        $model = D('Bpm/WorkflowProgress', 'Model');

        $progresses = $model->where($map)->order('WorkflowProgress.created ASC, WorkflowProgress.id ASC')->select();

        foreach($progresses as $k=>$v) {
            if(
                (WorkflowService::executors_has_some($v['executor'], 'auto:wait') ||
                WorkflowService::executors_has_some($v['executor'], 'auto:auto')) &&
                !in_array($v['node_type'], ['start', 'end'])
            ) {
                unset($progresses[$k]);
            }
        }

        return reIndex($progresses);

    }

    /*
     * 获取最近执行的最后一条记录
     *
     * */
    public function get_latest_progress($workflow_id, $source_id) {
        $map = [
            'workflow_id' => $workflow_id,
            'source_id'   => $source_id
        ];
        return D('Bpm/WorkflowProgress', 'Model')->where($map)->order('created DESC, id DESC')->find();
    }

    /*
     * 为列表附带工作流进程最后信息
     * @param array $data 列表数据
     * */
    public function assign_last_progress_to_list($source_data) {

        $items_ids = get_array_by_field($source_data, 'id');
        $workflow_ids = get_array_by_field($source_data, 'workflow_id');
        if(!$workflow_ids) {
            return $source_data;
        }

        $model = D('Bpm/WorkflowProgress', 'Model');
        $map = [
            'WorkflowProgress.source_id' => ['IN', $items_ids],
            'WorkflowProgress.workflow_id' => ['IN', $workflow_ids]
        ];
        $all_progress = $model
            ->where($map)
            ->order('WorkflowProgress.created DESC, WorkflowProgress.id DESC')
            ->select();
        $progress_data = [];
        foreach($all_progress as $ap) {
            $source_id = $ap['source_id'];
            if(!$progress_data[$source_id]) {
                $progress_data[$source_id] = $ap;
            } else {
                if($progress_data[$source_id]['id'] < $ap['id']) {
                    $progress_data[$source_id] = $ap;
                }
            }
        }

        foreach($source_data as $k=>$v) {
            $source_data[$k]['workflow_node_label'] = $progress_data[$v['id']]['node_label'];
            $source_data[$k]['workflow_node_status_label'] =
                $progress_data[$v['id']]['node_status_label']
                ? $progress_data[$v['id']]['node_status_label']
                : $progress_data[$v['id']]['node_label'];
        }

        return $source_data;

    }

    /*
     * 获取用户相关的工作流记录
     * @param array $map = [
     *
     * ]
     *
     * */
    public function get_user_related_progress($map) {
        $model = D('Bpm/WorkflowProgress', 'Model');
        $result = $model->where($map)->select();
        return $result;
    }

}