<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of StockModel
 *
 * @author 志鹏
 */
class StockModel extends CommonModel {
    
    public function select($options = array()) {
        $data = parent::select($options);
        if(!$data) {
            return $data;
        }
        
        foreach($data as $k=>$v) {
            if($v["managers"]) {
                $managers = explode(",", $v["managers"]);
                $mnames = array();
                foreach($managers as $m) {
                    $mnames[] = toTruename($m);
                }
                $data[$k]["managers_name"] = implode(", ", $mnames);
            }
        }
        
        return $data;
    }
    
}
