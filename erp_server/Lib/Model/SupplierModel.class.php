<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of SupplierModel
 *
 * @author 志鹏
 */
class SupplierModel extends RelationModel {
    
    protected $_link = array(
        "User" => BELONGS_TO,
        "SupplierLinkman" => HAS_MANY
    );
    
    protected $status_lang = array(
        "private", "public"
    );
    
    public function select($options=array()) {
        $data = parent::select($options);
        foreach($data as $k=>$v) {
            $data[$k]["status_lang"] = $this->status_lang[$v["status"]];
        }
        return $data;
    }
    
    public function find($options = array()) {
        $data = parent::find($options);
        if(!$data) {
            return $data;
        }
        $data["status_lang"] = $this->status_lang[$data["status"]];
        return $data;
    }
    
}
