<?php

/**
 * @filename CompleteProcess.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-12-8  9:29:25
 * @Description
 * 
 */
class FinancePayCompleteProcess extends WorkflowAbstract {
    
    public function run() {

        $model = D("FinancePayPlan");
        $plan = $model->find($this->mainrowId);
        
        if(!$plan["account_id"] and !IS_POST) {
            $this->response(array(
                "type" => "redirect",
                "location" => sprintf("/doWorkflow/FinancePayPlan/confirm/%d/%d", $this->currentNode["id"], $this->mainrowId)
            ));
        }
        
        $accountId = $plan["account_id"] ? $plan["account_id"] : abs(intval($_POST["account_id"]));
        if(!$accountId) {
            $this->error("params_error");
        }

//        var_dump($plan);exit;
        $data = array(
            "account_id" => $accountId,
            "amount" => $plan["amount"],
            "type_id" => $plan["type_id"],
            "type" => 2
        );
        $recordModel = D("FinanceRecord");
        $recordId = $recordModel->addRecord($data);
//        echo $recordModel->getLastSql();exit;
//        var_dump($recordId) ;exit;
        if($recordId) {
            $model->where(array("id=".$this->mainrowId))->save(array(
                "status" => 1,
                "financer_id" => getCurrentUid(),
                "account_id" => $accountId,
                "pay_dateline" => CTS
            ));
        }
//        echo $model->getLastSql();exit;
//        exit;
    }
    
}

?>
