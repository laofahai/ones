<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 7/7/15
 * Time: 08:56
 */

namespace Bpm\Service;


use Common\Lib\Schema;
use Common\Model\CommonModel;
use MessageCenter\Service\MessageCenter;

class WorkflowService extends CommonModel {

    protected $_auto = array(
        array("company_id", "get_current_company_id", self::MODEL_INSERT, "function")
    );

    protected $current_node;

    // 自动执行的「用户角色」，将不会出现在用户可见操作中
    protected $auto_executor = [
        'a:a' // 自动执行
        , 'w:o' // 等待外部响应
    ];


    /*
     * 获取工作流节点列表，调用Bpm/WorkflowNodeService中的 get_nodes方法
     * @param integer $workflow_id 所属工作流ID
     * @return array
     * */
    public function get_nodes($workflow_id) {
        $map = [
            'workflow_id' => $workflow_id
        ];

        $nodes = D('Bpm/WorkflowNode')->where($map)->select();
        foreach($nodes as $k=>$node) {
            if($node['next_nodes']) {
                $nodes[$k]['next_nodes'] = explode(',', $node['next_nodes']);
            }
            if($node['condition_true_nodes']) {
                $nodes[$k]['condition_true_nodes'] = explode(',', $node['condition_true_nodes']);
            }
            if($node['condition_false_nodes']) {
                $nodes[$k]['condition_false_nodes'] = explode(',', $node['condition_false_nodes']);
            }
        }
        return $nodes;
    }

    /*
     * 获得某一数据的下一工作流节点
     * @param mixed $workflow_id_or_module
     * @param integer $source_id 源数据ID
     * @param boolean $check_permission 是否顺路检测执行权限
     * @return array
     * */
    public function get_next_nodes($workflow_id_or_module, $source_id, $check_permission=false) {

        if($workflow_id_or_module > 0) {
            $workflow = $this->where(['id'=>$workflow_id_or_module])->find();
        } else {
            $workflow = $this->get_workflow('', $workflow_id_or_module);
        }

        $progress = D('Bpm/WorkflowProgress');
        $latest_progress = $progress->get_latest_progress($workflow['id'], $source_id);

        if(!$latest_progress) {
            return [];
        }

        // 最近执行节点
        $node_service = D('Bpm/WorkflowNode');
        $latest_node = $node_service->where(['id'=>$latest_progress['workflow_node_id']])->find();

        if(!$latest_node) {
            return [];
        }

        $next_nodes_id = explode(',', $latest_node['next_nodes']);
        if(!$next_nodes_id) {
            return [];
        }

        $next_nodes = $node_service->where([
            'id' => ['IN', $next_nodes_id]
        ])->select();

        $next_nodes = $next_nodes ? $next_nodes : [];

        return $next_nodes;
    }


    /*
     * 获得工作流
     * @param string $module 模块
     * @param integer|null $workflow_id 工作流ID，如果为空返回默认工作流，如无默认，返回第一条
     * */
    public function get_workflow($workflow_id=null, $module=null) {

        if(!$module && !$workflow_id) {
            return false;
        }

        $map = [];

        if($module) {
            $map['module'] = $module;
        }

        if($workflow_id) {
            $map['id'] = $workflow_id;
        } else {
            $map['is_default'] = 1;
        }

        $workflow = $this->where($map)->find();

        if(!$workflow && $module) {
            $workflow = $this->where(['module'=>$module])->find();
        }

        if(!$workflow) {
            $this->error = __('bpm.Can not find workflow');
            return false;
        }
        $workflow = Schema::data_format($workflow, 'workflow', true);

        $nodes = $this->get_nodes($workflow['id']);

        foreach($nodes as $k=> $node) {
            if($node['node_type'] === 'start') {
                $workflow['start_node'] = $node;
            }
//            $serialized_config = unserialize($node['widget_config']);
//            $serialized_config = $serialized_config ? $serialized_config : [];
//            $nodes[$k] = array_merge($node, $serialized_config);
        }

        $nodes = Schema::data_format($nodes, 'workflow_node', true);

        $workflow['nodes'] = $nodes;

        return $workflow;
    }

    /*
     * 工作流启动
     * 获取开始节点，写入工作流进程表
     *
     * @param integer $workflow 工作流ID
     * @param integer $source_id 源数据ID
     * */
    public function start_progress($workflow_id, $source_id, $meta_data=[]) {
        $workflow = $this->get_workflow($workflow_id);
        if(!$workflow_id['start_node']) {
            $this->error = __('bpm.Can not found start node of workflow');
            return false;
        }
        return $this->exec($source_id, $meta_data, $workflow['start_node'], $workflow);
    }

    /*
     * 工作流节点执行
     * 写入进程表
     *
     * @param integer $source_id 源数据ID
     * @param array $meta_data 将插入progress表的其他数据
     * @param mixed $node 执行节点ID或节点数组
     *
     * @todo 检测节点ID合法性，包括是否存在，是否是当前last节点的下一节点或condition节点
     * @todo 检测节点执行权限
     * @todo 响应类型
     * @todo 提醒接口
     * @todo 同步分支节点，考虑可做分支互相下级，并设定最大执行次数
     * */
    public function exec($source_id, $meta_data=[], $node=null, $workflow=null, $auto=false) {
        if(!is_array($node) and $node > 0) {
            $node = D('Bpm/WorkflowNode')->where(['id'=>$node])->find();
        } else if(!$node) {
            // 自动获取下一节点 @todo
        }

        if(!$node) {
            $this->error = __('bpm.Workflow node not found');
            return false;
        }

        if(!is_array($workflow) || !$workflow['nodes']) {
            $workflow = $this->get_workflow($node['workflow_id']);
        }

        if(!$workflow) {
            $this->error = __('bpm.Workflow not found') . ': ' . $node['workflow_id'];
            return false;
        }

        /*
         * 当前执行节点
         * */
        $this->current_node = $node;

        /*
         * 当前工作流所有节点
         * */
        $current_workflow_nodes = get_array_to_ka($workflow['nodes']);

        /*
         * 检测当前执行节点是否为上一节点的next_nodes/condition_true_nodes/condition_false_nodes
         * */
        $progress_service = D('Bpm/WorkflowProgress');
        $latest_progress = $progress_service->get_latest_progress($workflow['id'], $source_id);

        if($latest_progress) {
            $latest_node_next_nodes = array_merge(
                (array)$current_workflow_nodes[$latest_progress['workflow_node_id']]['next_nodes'],
                (array)$current_workflow_nodes[$latest_progress['workflow_node_id']]['condition_true_nodes'],
                (array)$current_workflow_nodes[$latest_progress['workflow_node_id']]['condition_false_nodes']
            );

            if(!in_array($this->current_node['id'], $latest_node_next_nodes)) {
                $this->error = __('bpm.Not a verified workflow node');
                return false;
            }
        }

        // 获取源数据
        list($app, $module) = explode('.', $workflow['module']);
        $source_model = sprintf('%s/%s', ucfirst($app), ucfirst($module));
        $source_data = D($source_model)->where(['id'=>$source_id])->find();

        $method = 'exec_'.$node['action_type'];
        /*
         * 根据不同动作类型执行
         * */
        $exec_result = $this->$method($node['action'], $source_model, $source_data);

        /*
         * 非条件判断节点执行结果为false时，判定执行失败，中断。
         * */
        if(false === $exec_result && $node['node_type'] !== 'cond') {
            return false;
        }

        $ignore_executor = ['a:a', 'w:o'];
        if(!$auto && !in_array($node['executor'], $ignore_executor)) {
            $ms_module = $node['label'];
            $subject = $source_data['subject'] ? $source_data['subject'] : $source_data['name'];
            $subject = $subject ? $subject : "#" . $source_id;
            if($source_data['bill_no']) {
                $subject .= ' ' . $source_data['bill_no'];
            }
            MessageCenter::broadcast(['exec'], [
                "id" => $source_id,
                "module" => $ms_module,
                "subject" => $subject
            ]);
        }

        /*
         * 执行结果中不包含中断信号
         * */
        if(!$exec_result['pause']) {
            $data = [
                'source_id' => $source_id,
                'workflow_id' => $node['workflow_id'],
                'workflow_node_id' => $node['id']
            ];
            $data['remark'] = $this->exec_remark ? $this->exec_remark : "";
            $data = array_merge($meta_data, $data);
            // 写入进程表
            if(false === $progress_service->create($data)){
                $this->error = __('bpm.Unverified Progress Object');
                return false;
            }

            if(false === $progress_service->add()) {
                $this->error = __('bpm.Log workflow progress failed');
                return false;
            }
        } else {
            $response = $exec_result;
            if(is_array($response) && $response) {
                return $this->response($response);
            } else {
                return $response;
            }
        }

        /*
         * 不同的节点类型
         * */
        // 条件判断节点
        if($node['node_type'] === 'cond') {
            if($exec_result === true) { // 条件为真时，执行condition_true_nodes
                $condition_next_nodes = $node['condition_true_nodes'];
            } else { // 否则执行condition_true_nodes
                $condition_next_nodes = $node['condition_false_nodes'];
            }

            // 自动执行下一节点
            if($condition_next_nodes) {
                $condition_next_nodes = explode(',', $condition_next_nodes);
                foreach($condition_next_nodes as $nid) {
                    $this->exec($source_id, $meta_data, $nid, null, true);
                }
            }
        }


        /*
         * 执行结果类型
         *
         *  「1」 redirect 跳转至某一页面 uri: storage/stockIn/confirm/:id
         *  「2」 message 显示一个提示信息  level=info|success|danger..., content
         *
         * $exec_result = [
         *  type: 类型
         *  pause: 是否中断
         *  other_params
         * ];
         * */
        $response = $exec_result;

        /*
         * 检测后续节点是否自动执行
         * */
        $next_nodes_ids = explode(',', $node['next_nodes']);
        $next_nodes = [];
        foreach($current_workflow_nodes as $node_id=>$node_info) {
            if(in_array($node_id, $next_nodes_ids)) {
                $next_nodes[$node_id] = $node_info;
            }
        }
        foreach($next_nodes as $node_id=>$node_info) {
            if($node_info['executor'] === 'a:a') {
                $this->exec($source_id, $meta_data, $node_id);
            }
        }


        if(is_array($response) && $response) {
            return $this->response($response);
        } else {
            return $response;
        }

    }

    /*
     * 执行service api [E]xecute service api
     * */
    protected function exec_e($action, $source_model, $source_data) {
        $source_model = D($source_model, 'Service');
        if(!method_exists($source_model, $action)) {
            $this->error = __('bpm.Service API not found'). ': '. $action;
            return false;
        }

        /*
         * 所有service api接受参数为 [
         *  $id // 源数据ID,
         *  $node // 当前执行工作流节点对象
         * ]
         * 返回为 false 或 数组 [
         *  type: 'redirect|message|...'
         *  pause: 是否中断
         *  other_params ...
         * ]
         * */
        $result = $source_model->$action($source_data['id'], $this->current_node);

        $this->exec_remark = $source_model->exec_remark ? $source_model->exec_remark : "";

        if(false === $result) {
            $this->error = $source_model->getError();
            return false;
        }
        return $result;
    }

    /*
     * 什么都不做 Do [N]othing
     * */
    protected function exec_n($action, $source_model, $source_data) {
        return [];
    }

    /*
     * 更新源数据字段 [U]pdate source row field
     * */
    protected function exec_u($action, $source_model, $source_data) {
        return [];
    }

    /*
     * 工作流中直接返回数据
     * */
    public function response($data) {
        echo json_encode($data);
        return $data;
    }

    /*
     * 对当前执行节点进行权限验证
     * */
    public function check_node_permission($node, $source_row) {
        $current_user_id = get_current_user_id();
        list($executor_role, $executor) = explode(':', $node['executor']);

        if(in_array($node['executor'], $this->auto_executor)) {
            return true;
        }
        if($node['executor'] == 'a:o' && $source_row['user_info_id'] == $current_user_id) {
            return true;
        }

        switch($executor_role) {
            case "r":
                break;
            case "d":
                break;
            case "u":
                return $executor && ($executor == $current_user_id);
                break;
        }
    }

    /*
     * 响应「等待外部响应节点」
     * @param $response_to_model 响应模型 eg: sale.orders
     * @param $response_to_id 响应数据ID
     * @param $source_data 来源数据
     * */
    public function response_to_node($response_to_model, $response_to_id, $source_data=[]) {
        $model = D(model_alias_to_name($response_to_model));
        $response_to_data = $model->where(['id'=>$response_to_id])->find();
        if(!$response_to_data) {
            return false;
        }

        $progress_model = D('Bpm/WorkflowProgress');
        $latest_progress = $progress_model->get_latest_progress($response_to_data['workflow_id'], $response_to_id);

        if(!$latest_progress) {
            return false;
        }

        $next_nodes = explode(',', $latest_progress['next_nodes']);
        $next_nodes = D('Bpm/WorkflowNode')->where([
            'id' => ['IN', $next_nodes]
        ])->select();
        if(!$next_nodes) {
            return false;
        }

        foreach($next_nodes as $node) {
            if($node['executor'] === 'w:o') {
                return $this->exec($response_to_id, [], $node['id']);
                break;
            }
        }

        return false;
    }

}