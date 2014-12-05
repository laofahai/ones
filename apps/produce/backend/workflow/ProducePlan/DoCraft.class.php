<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * 执行生产工序进程
 * 当前生产计划未完全完成之前，一直可以执行
 * @author nemo
 * @ 判断是否执行结束
 */
class ProducePlanDoCraft extends WorkflowAbstract {
    
    public function run() {
        $detailModel = D("ProducePlanDetail");
        $details = $detailModel->where("plan_id=".$this->mainrowId)->select();
        
        if(count($details) > 0) {
            $this->response(array(
                "type" => "redirect",
                "location" => sprintf("/doWorkflow/Produce/doCraft/%d/%d", $this->currentNode["id"], $this->mainrowId)
            ));
        }
        
        exit;
    }
}
