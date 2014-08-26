<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of FinanceRecordViewModel
 *
 * @author nemo
 */
class FinanceRecordViewModel extends CommonViewModel {
    
    protected $viewFields = array(
        "FinanceRecord" => array("*", "_type"=>"left"),
        "FinanceAccount"=> array("name"=>"account","_on"=>"FinanceRecord.account_id","_type"=>"left"),
        "Types" => array("name"=>"record_type", "_on"=>"Types.id=FinanceRecord.type_id", "_type"=>"left"),
    );
    
    public function select($options=array()) {
        $data = parent::select($options);
        
        if(!$data) {
            return $data;
        }
        
        foreach($data as $k=>$v) {
            $data[$k]["sponsor"] = toTruename($v["user_id"]);
            $data[$k]["financer"] = toTruename($v["financer_id"]);
            $data[$k]["balance_direction"] = $v["type"] == 1 ? "+" : "-";
        }
        
        return $data;
    }
    
}
