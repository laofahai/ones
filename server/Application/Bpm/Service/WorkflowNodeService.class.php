<?php

namespace Bpm\Service;
use Common\Model\CommonModel;

class WorkflowNodeService extends CommonModel {

    protected $_auto = array(
        array("company_id", "get_current_company_id", self::MODEL_INSERT, "function")
    );

    /*
     * 获取当前row的下一节点
     * @param integer $source_id 源数据ID
     * @param string $row_model 源数据model
     *
     * @return array $next_nodes 下一节点s数组(二维)
     * */
    public function get_next_node($source_id, $source_model) {}

    /*
     * 执行工作流节点
     * @param integer $node_id 执行节点ID
     * @param integer $source_id 源数据ID
     * @param string $source_model 源数据模型
     *
     * @return mixed
     *  返回1: 执行状态，true or false getError
     *  返回2: 回调 跳转至某页面
     * */
    public function execute_node($node_id, $source_id, $source_model) {}


}