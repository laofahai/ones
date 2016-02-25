<?php

/*
 * @app Bpm
 * @package Bpm.service.WorkflowProgress
 * @author laofahai@TEam Swift
 * @link https://ng-erp.com
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
     * */
    public function get_progress($workflow_id, $source_id) {

        $model = D('Bpm/WorkflowProgress', 'Model');

        $map = [
            'WorkflowProgress.workflow_id' => $workflow_id,
            'WorkflowProgress.source_id' => $source_id
        ];
        return $model
            ->where($map)
            ->order('WorkflowProgress.created ASC')
            ->select();
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

}