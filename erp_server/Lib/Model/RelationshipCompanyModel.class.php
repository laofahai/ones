<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of RelationshipCompanyModel
 *
 * @author 志鹏
 */
class RelationshipCompanyModel extends RelationModel {
    
    protected $_link = array(
        "User" => BELONGS_TO,
        "RelationshipCompanyGroup" => array(
            'mapping_type'=>BELONGS_TO,
            "foreign_key" => "group_id",
            "mapping_name" => "Group"
        ),
        "RelationshipCompanyLinkman" => array(
            'mapping_type'=> HAS_MANY,
            'class_name'=> 'RelationshipCompanyLinkman',
            'foreign_key'=> 'relationship_company_id',
            'mapping_name'=> 'Linkman',
            'mapping_order'=> 'is_primary DESC, id ASC',
       ),
    );
    
    protected $status_lang = array(
        "private", "public"
    );
    
    public function select($options=array()) {
        $data = parent::select($options);
        
//        print_r($data);exit;
        
//        foreach($data as $k=>$v) {
//            $data[$k]["status_lang"] = $this->status_lang[$v["status"]];
//        }
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
