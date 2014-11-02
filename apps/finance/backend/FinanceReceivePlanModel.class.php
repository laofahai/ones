<?php

/**
 * @filename FinanceReceivePlanModel.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-12-8  8:59:31
 * @Description
 * 
 */
class FinanceReceivePlanModel extends CommonModel {
    
    protected $workflowAlias = "financeReceive";
    
    protected $_auto = array(
        array("create_dateline", CTS),
        array("status", 0),
        array("source_model", ""),
        array("source_id", ""),
        array("user_id", "getCurrentUid", 1, "function"),
    );

    /*
     * 财务收入计划新增接口
     * @param array $data
     *
     * **/
    public function record($data) {
        $data["create_dateline"] = CTS;
        $data["status"] = 0;
        $data["user_id"] = getCurrentUid();

        $lastId = $this->add($data);

        if(!$lastId) {
            Log::write($this->getLastSql(), Log::SQL);
            return false;
        }

        $workflow = new Workflow("financeReceive");
        $workflow->doNext($lastId, "", true);

        return $lastId;
    }

    public function toRelatedItem($sourceModel, $sourceId) {
        $map = array(
            "source_model" => $sourceModel,
            "source_id"    => $sourceId
        );
        return $this->field(
            "id, id AS bill_id,'FinanceReceivePlan' AS type,'money' AS icon,'finance/viewDetail/financeReceivePlan/id/' AS link"
        )->where($map)->order("id ASC")->select();
    }
    
}