<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 7/7/15
 * Time: 08:56
 *
 *
 */

namespace Bpm\Service;

use Common\Model\CommonModel;
use MessageCenter\Service\MessageCenter;


/*
    start=>start: 新入库单:> m:Storage/StockOut::check_full_in| past
    end=>end:> auto:auto 通知等待节点
    save_bill=>operation: 保存入库单|past
    confirm=>operation: 确认入库
    check_if_all_in=>condition: 已完全入库|approved
    continue_in=>operation: 可以继续入库|future

    start->save_bill(right)->confirm->check_if_all_in
    check_if_all_in(no, right)->continue_in->confirm
    check_if_all_in(yes)->end
    check_if_all_in(ok)->end

    start=>u:1,2|d:1
*/
class WorkflowService extends CommonModel {

    protected $_auto = array(
        array("company_id", "get_current_company_id", self::MODEL_INSERT, "function")
    );

    /*
     * 当前执行节点
     * */
    protected $current_node = [];

    // 自动执行的「用户角色」，将不会出现在用户可见操作中
    protected $auto_executor = [
        'auto: auto' // 自动执行
        , 'auto:wait' // 等待外部响应
    ];


    /*
     * 解析工作流程描述语言
     * @param string $str 完整工作流描述
     * @return [] 所有节点定义
     * */
    public function parse_process_language($str) {
        list($nodes_config, , $executors) = explode("\n\n", $str);

        $nodes_config = explode("\n", trim($nodes_config));
        $executors = explode("\n", trim($executors));

        $nodes = [];
        foreach($nodes_config as $node_config) {
            list($node_alias, $config) = explode("=&gt;", $node_config);
            list($node_type, $more_config) = explode(": ", $config);
            list($node_label, $flow_state) = explode("| ", $more_config);
            list($node_label, $node_action) = explode(':&gt; ', $node_label);
            list($node_label, $status_label) = explode(":", $node_label);

            $status_label = $status_label ? $status_label : null;
            $nodes[$node_alias] = [
                "alias" => $node_alias,
                "label" => $node_label,
                "status_label" => $status_label,
                "node_type"  => $node_type,
                "flow_type" => $flow_state,
                "action"=> $node_action
            ];
        }

        $cleared_executors = [];
        foreach($executors as $executor) {
            list($node_alias, $executor_config) = explode("=&gt;", $executor);
            $cleared_executors[trim($node_alias)] = trim($executor_config);
        }

        foreach($nodes as $k=>$node) {
            if(!$node) {
                unset($nodes[$k]);
            }
            $nodes[$k]['executor'] = $cleared_executors[$node['alias']];
        }

        return $nodes;
    }

    /*
     * 将工作流节点及流程还原为描述语言
     * @param integer $workflow_id 工作流ID
     * @return []
     * */
    public function to_language($workflow_id) {

        $workflow = $this->where(['id'=>$workflow_id])->find();

        $all_nodes = D('Bpm/WorkflowNode')->where(['workflow_id'=>$workflow_id])->select();
        $all_nodes = get_array_to_ka($all_nodes, "alias");

        $node_tpl = "%(alias)s=>%(type)s: %(label)s:> %(action)s";
        $search = ['%(alias)s','%(type)s','%(label)s','%(action)s'];
        $nodes = [];
        $executors = [];
        foreach($all_nodes as $alias => $node) {
            $replace = [
                $alias,
                $node['node_type'],
                $node['label'],
                $node['action'] ? $node['action'] : ""
            ];
            $node_line = str_replace($search, $replace, $node_tpl);
            if($node['flow_type']) {
                $node_line.= "| ".$node['flow_type'];
            }
            array_push($nodes, $node_line);
            if($node['executor']) {
                array_push($executors, sprintf('%s=>%s', $alias, $node['executor']));
            }
        }

        $response = [];
        array_push(
            $response,
            implode("\n", $nodes),
            str_replace('&gt;', '>', $workflow['process']),
            implode("\n", $executors)
        );

        return implode("\n\n", $response);
    }

    /*
     * 返回某节点的下一可执行节点
     * @param integer $workflow_id
     * @param [] $node_alias 节点别名
     * @return 下一个/多个可执行节点  二维数组
     *
     * @todo 节点类型判断
     * */
    public function get_next_nodes_by_alias($workflow_id, $node_alias) {

        // 根据多个节点获取
        $node_alias = is_array($node_alias) ? $node_alias : [$node_alias];

        $workflow = $this->where(['id'=>$workflow_id])->find();

        $all_nodes = D('Bpm/WorkflowNode')->where(['workflow_id'=>$workflow_id])->select();
        $all_nodes = get_array_to_ka($all_nodes, "alias");

        $processes = explode("\n", $workflow['process']);

        $next_nodes = [];

        /*
         * 遍历所有的流程描述
         * */
        foreach($processes as $process_in_line) {
            $process_in_line = str_replace('&gt;', '>', $process_in_line);
            foreach($node_alias as $na) {
                $regex = '/'.$na.'([\(\)\w]*)->([\w\d\_]+)/';
                preg_match($regex, $process_in_line, $matches);

                // 条件判断节点
                if(in_array($matches[1], ['(yes)', '(no)'])) {
                    $all_nodes[$matches[2]]['condition'] = $matches[1] === '(yes)' ? true : false;
                }

                if($matches[2]) {
                    array_push($next_nodes, $all_nodes[$matches[2]]);
                }
            }
        }
        return $next_nodes;
    }

    public function get_next_nodes_by_id($workflow_id, $node_id) {
        $node_id = is_array($node_id) ? $node_id : [$node_id];
        $map = [
            "workflow_id" => $workflow_id,
            "id" => ['IN', $node_id]
        ];

        $nodes = D('Bpm/WorkflowNode')->where($map)->select();

        return $this->get_next_nodes_by_alias($workflow_id, get_array_by_field($nodes, 'alias'));
    }

    /*
     * 获得某项当前工作的下一/N可执行节点
     * */
    public function get_next_nodes_by_source($workflow_id, $source_id, $only_executable=false) {
        $latest_progress = D('Bpm/WorkflowProgress')->get_latest_progress($workflow_id, $source_id);
        if(!$latest_progress) {
            return [];
        }

        $nodes = $this->get_next_nodes_by_id($workflow_id, $latest_progress['workflow_node_id']);

        if($only_executable) {
            $tmp = $nodes;
            $nodes = [];

            foreach($tmp as $k=>$v) {
                if(
                    self::executors_has_some($v['executor'], 'auto:auto') ||
                    self::executors_has_some($v['executor'], 'auto:wait')
                ) {
                    continue;
                }

                array_push($nodes, $v);
            }
        }

        return $nodes;

    }

    /*
     * 保存工作流
     * @param string $str 工作流详情
     * @param integer $workflow_id 工作流ID
     *
     * 工作流会在被使用时变为锁定状态,此时不可再进行修改,仅对工作流可执行者进行调整
     *
     * */
    public function save_workflow($str, $workflow_id) {

        $workflow = $this->where(['id'=>$workflow_id])->find();

        if(!$workflow) {
            $this->error = __('common.Object not found');
            return false;
        }

        list($nodes_config, $process, $executors) = explode("\n\n", $str);
        $nodes = $this->parse_process_language($str);

        $node_service = D('Bpm/WorkflowNode');

        if(!$workflow['locked']) {
            $this->where([
                'id' => $workflow_id
            ])->save(
                [
                    'last_update' => CURRENT_DATE_TIME,
                    'process' => $process
                ]
            );
            $node_service->where([
                'workflow_id' => $workflow_id
            ])->delete();
            foreach($nodes as $node) {
                $node['workflow_id'] = $workflow_id;
                $node['company_id'] = $workflow['company_id'] ? $workflow['company_id'] : get_current_company_id();
                $node_service->create($node);
                if(!$node_service->add()) {
                    // @todo error
                    $this->error = __('bpm.Add node failed');
                    return false;
                }

            }
        } else { // 已锁定的工作流,仅能修改执行者等信息
            $this->where([
                'id' => $workflow_id
            ])->save(
                [
                    'last_update' => CURRENT_DATE_TIME,
                    'locked' => 1
                ]
            );
            $can_be_update = ['executor', 'label', 'status_label'];
            foreach($nodes as $node) {
                $saved_data = [];
                foreach($can_be_update as $cbu) {
                    $saved_data[$cbu] = $node[$cbu];
                }
                $node_service->where([
                    'workflow_id' => $workflow_id,
                    'alias' => $node['alias']
                ])->save($saved_data);
            }
        }


        return $workflow_id;

    }

    /*
     * 获取可被用户执行的节点
     * */
    public function get_executable_nodes($workflow_id) {
        $node_service = D('Bpm/WorkflowNode');
        $all_nodes = $node_service->where([
            'workflow_id' => $workflow_id
        ])->select();

        $response = [];
        $ignore_executor = $this->auto_executor;
        foreach($all_nodes as $node) {
            foreach($ignore_executor as $ie) {
                if(self::executors_has_some($node['executor'], $ie)) {
                    break;
                }
                if(array_key_exists($node['alias'], $response)) {
                    break;
                }
                $response[$node['alias']] = $node;
            }
        }

        return $response;
    }

    /*
     * 工作流开始执行
     * */
    public function start_progress($workflow_id, $source_id, $meta_data) {
        $workflow = $this->where(['id'=>$workflow_id])->find();

        // 将工作流锁定,不可再修改
        if(!$workflow['locked']) {
            $this->where(['id'=>$workflow_id])->save([
                'locked' => 1
            ]);
        }

//        $start_node_alias = array_shift(explode('-&gt;', $workflow['process']));
//        $start_node_alias = array_shift(explode('(', $start_node_alias));
        $node_id = D('Bpm/WorkflowNode')->where([
            'workflow_id' => $workflow_id,
            'node_type' => 'start'
        ])->getField('id');

        return $this->exec($workflow_id, $source_id, $node_id, $meta_data);
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
    public function exec($workflow_id, $source_id, $node_id, $meta_data=[]) {

        if(!$workflow_id || !$source_id || !$node_id) {
            $this->error = __('common.Params Error') .': ' .'workflow exec';
            return false;
        }

        $progress_service = D('Bpm/WorkflowProgress');
        $node_service = D('Bpm/WorkflowNode');

        $workflow = $this->where(['id'=>$workflow_id])->find();

        // 获取源数据
        list($app, $module) = explode('.', $workflow['module']);

        $this->current_node = $node = $node_service->where([
            'id' => $node_id,
            'workflow_id' => $workflow_id
        ])->find();

        // @todo 检测节点可执行合法性,节点可执行权限检测

        preg_match('/([a-zA-Z]{1}):(.*)/', $node['action'], $action_contents);

        $action_type = $action_contents[1];
        $action_content = $action_contents[2];

        // 动作类型为Class::method类型时
        if(strpos($action_content, "::") !== false) {
            list($action_model, $action_method) = explode("::", $action_content);
            $action_model = D($action_model);
        }

        $source_model = D(sprintf('%s/%s', ucfirst($app), ucfirst($module)));
        $source_data = $source_model->where(['id'=>$source_id])->find();

        $method = 'exec_'.$action_type;


        /*
         * 根据不同动作类型执行
         * */
        if(method_exists($this, $method)) {
            $exec_result = $this->$method(
                isset($action_method) ? $action_method : $action_content,
                isset($action_model) ? $action_model : $source_model,
                $source_data
            );
        } else {
            $exec_result = true;
        }

        /*
         * 非条件判断节点执行结果为false时，判定执行失败，中断。
         * */
        if(false === $exec_result && $node['node_type'] !== 'condition') {
            return false;
        }

        $ignore_executor = ['auto:auto', 'auto:wait'];
        // 广播事件
        if($node['action'] !== 'auto:auto' && !in_array($node['executor'], $ignore_executor)) {
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
         * 执行结果中包含中断信号则直接返回,通常用作页面跳转或消息提示等
         * */
        if(isset($exec_result['pause'])) {
            if(!$exec_result['return']) {
                return $this->response($exec_result);
            } else {
                return $exec_result;
            }
        } else {
            $data = [
                'source_id' => $source_id,
                'workflow_id' => $workflow_id,
                'workflow_node_id' => $node_id
            ];
            $data['remark'] = $this->exec_remark ? $this->exec_remark : "";
            $data = array_merge($meta_data, $data);
            unset($data['id']);
            // 写入进程表
            if(false === $progress_service->create($data)){
                $this->error = __('bpm.Unverified Progress Object');
                return false;
            }

            if(false === $progress_service->add()) {
                $this->error = __('bpm.Log workflow progress failed');
                return false;
            }
        }

        $next_nodes = $this->get_next_nodes_by_id($workflow_id, $node_id);

        foreach($next_nodes as $node_info) {
            if(self::executors_has_some($node_info['executor'], 'auto:auto')) {

                /*
                 * 条件判断节点
                 * */
                if(isset($node_info['condition'])) {
                    if($exec_result && $node_info['condition']) {
                        $this->exec($workflow_id, $source_id, $node_info['id'], $meta_data);
                    } else if(!$exec_result && !$node_info['condition']) {
                        $this->exec($workflow_id, $source_id, $node_info['id'], $meta_data);
                    }
                    continue;
                }

                $this->exec($workflow_id, $source_id, $node_info['id'], $meta_data);

            }
        }

        if(is_array($exec_result) && !$exec_result['return']) {
            return $this->response($exec_result);
        } else {
            return $exec_result;
        }

    }

    protected function exec_($action, $source_model, $source_data) {
        return $this->exec_n($action, $source_model, $source_data);
    }

    /*
     * 执行service api [E]xecute service api
     * */
    protected function exec_m($action, $source_model, $source_data) {
        if(!method_exists($source_model, $action)) {
            $this->error = __('bpm.Service API not found'). ': '. sprintf('%s::%s', $source_model->getModelName(), $action);
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
     * 更新原始数据status字段
     * */
    protected function exec_u($action, $source_model, $source_data) {
        $save_data = [];

        $action = explode(',', $action);
        foreach($action as $a) {
            list($k, $v) = explode('=', $a);
            $save_data[trim($k)] = trim($v);
        }

        $source_model->create($save_data);

        return $source_model->where([
            'id' => $source_data['id']
        ])->save() === false ? false : true;
    }

    /*
     * 什么都不做 Do [N]othing
     * */
    protected function exec_n($action, $source_model, $source_data) {
        return;
    }

    /*
     * 对当前执行节点进行权限验证
     * */
    public function check_node_permission($node, $source_row) {

        $current_user_id = get_current_user_id();
        $user_info = D('Account/UserInfo')->where(['id'=>$current_user_id])->find();
        $user_role_map = D('Account/AuthUserRole')->where(['user_info_id'=>$current_user_id])->select();

        $executor_rules = explode('|', $node['executor']);
        foreach($executor_rules as $rule) {
            list($executor_role, $executor) = explode(':', $rule);

            if(in_array($rule, $this->auto_executor)) {
                return true;
            }

            // 数据创建者
            if(false !== strpos($rule, 'auto:owner') && $source_row['user_info_id'] == $current_user_id) {
                return true;
            }

            switch($executor_role) {
                case "r": // role
                    foreach($user_role_map as $role_map) {
                        if(in_array($role_map['auth_role_id'], explode(',', $executor))) {
                            return true;
                        }
                    }
                    break;
                case "d": // department
                    if(in_array($user_info['department_id'], explode(',', $executor))) {
                        return true;
                    }
                    break;
                case "u": // user
                    if(in_array($current_user_id, explode(',', $executor))) {
                        return true;
                    }
                    break;
            }
        }

        return false;

    }

    /*
     * 验证执行者中是否包含某个角色/用户/部门
     * @param string $executors_string 源节点执行者定义字符串
     * @param string $will_be_checked_executor 需认证的执行者字符串
     * */
    static public function executors_has_some($executors_string, $will_be_checked_executor) {
        list($type, $need_check_id) = explode(':', $will_be_checked_executor);
        $executor_rules = explode('|', $executors_string);
        foreach($executor_rules as $rule) {
            list($executor_role, $executor_ids) = explode(':', $rule);

            if($type === $executor_role) {
                $executor_ids = explode(',', $executor_ids);
                if(in_array($need_check_id, $executor_ids)) {
                    return true;
                }
            }
        }

        return false;
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
            return;
        }

        $next_nodes = $this->get_next_nodes_by_source($response_to_data['workflow_id'], $response_to_id);

        if(!$next_nodes) {
            return;
        }

        foreach($next_nodes as $node) {
            if(self::executors_has_some($node['executor'], 'auto:wait')) {
                return $this->exec($response_to_data['workflow_id'], $response_to_id, $node['id']);
                break;
            }
        }

        return;
    }

    /*
     * 工作流中直接返回数据
     * */
    public function response($data) {
        echo json_encode($data);
        return $data;
    }

}