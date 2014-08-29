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
class RelationshipCompanyModel extends CommonRelationModel {
    
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

    public $searchFields = array(
        "name", "pinyin", "address"
    );
    
    protected $status_lang = array(
        "private", "public"
    );
    
//    public function select($options=array()) {
//        $data = parent::select($options);
////        echo $this->getLastSql();exit;
//
////        print_r($data);exit;
//
////        foreach($data as $k=>$v) {
////            $data[$k]["status_lang"] = $this->status_lang[$v["status"]];
////        }
//        return $data;
//    }
    
//    public function find($options = array()) {
//        $data = parent::find($options);
//        if(!$data) {
//            return $data;
//        }
//        $data["status_lang"] = $this->status_lang[$data["status"]];
//        return $data;
//    }


    public function newCompany($baseInfo, $contacts) {
        $this->startTrans();
        $id = $this->add($baseInfo);
        if(!$id) {
            $this->error = "insert failed";
            $this->rollback();
            return false;
        }

        $model = D("RelationshipCompanyLinkman");
        foreach($contacts as $row) {
            $row["relationship_company_id"] = $id;
            if(false === $model->add($row)) {
                $this->error = "insert contact failed";
                $this->rollback();
                return false;
            }
        }

        tag("insert_dataModel_data", $params);

        $this->commit();

        return $id;

    }

    public function editCompany($baseInfo, $contacts, $id) {
        $this->startTrans();
        if(false === $this->where("id=".$id)->save($baseInfo)) {
//            echo $this->getLastSql();exit;
//            var_dump($baseInfo);exit;
            $this->error = "edit company failed while base info.";
            $this->rollback();
            return false;
        }

        $model = D("RelationshipCompanyLinkman");
        foreach($contacts as $row) {
            if(false === $model->where("id=".$row["id"])->save($row)) {
                $this->error = "edit contact failed";
                $this->rollback();
                return false;
            }
        }

        $this->commit();

        return true;
    }
    
}
