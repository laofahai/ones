<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of ProducePlanModel
 *
 * @author nemo
 */
class ProducePlanModel extends CommonModel {
    
    public $workflowAlias = "produce";
    
    public function newPlan($data) {
        $rows = $data["rows"];
        unset($data["rows"]);
        
        $this->startTrans();
        
        $id = $this->add($data);
        
        if(!$id) {
            $this->rollback();
            return false;
        }
        
        $detailModel = D("ProducePlanDetail");
        foreach($rows as $row) {
            $row["plan_id"] = $id;
            $rs = $detailModel->add($row);
            if(!$rs) {
                $this->rollback();
                return false;
            }
        }
        
        $this->commit();
        
        return $id;
        
    }
}
