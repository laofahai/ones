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
class RelationshipCompanyModel extends CommonModel {
    
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

        $baseInfo["id"] = $id;

        $params = array(
            "crmBaseInfo",
            $baseInfo
        );

        tag("insert_dataModel_data", $params);

        $model = D("RelationshipCompanyLinkman");
        foreach($contacts as $row) {
            $row["relationship_company_id"] = $id;
            $rowId = $model->add($row);
            if(false === $rowId) {
                $this->error = "insert contact failed";
                $this->rollback();
                return false;
            }
            $row["id"] = $rowId;

            $params = array(
                "crmContact",
                $row
            );
            tag("insert_dataModel_data", $params);

        }

        $this->commit();

        return $id;

    }

    public function editCompany($baseInfo, $contacts, $id) {

//        print_r($contacts);exit;

        $this->startTrans();
        if(false === $this->where("id=".$id)->save($baseInfo)) {
//            echo $this->getLastSql();exit;
//            var_dump($baseInfo);exit;
            $this->error = "edit company failed while base info.";
            $this->rollback();
            return false;
        }

        $_POST["id"] = $id;
        $params = array(
            "crmBaseInfo",
            $baseInfo
        );

        tag("insert_dataModel_data", $params);

        $model = D("RelationshipCompanyLinkman");
        $tmp = $model->where("relationship_company_id=".$id)->select();
        foreach($tmp as $t) {
            $rowIds[] = $t["id"];
        }

        $params = array(
            $rowIds,
            "crmContact"
        );

        tag("delete_dataModel_data", $params);

        $model->where("relationship_company_id=".$id)->delete();
        foreach($contacts as $row) {
            $row["relationship_company_id"] = $id;
            unset($row["id"]);
            $rowId = $model->add($row);
//            print_r($contacts);exit;
            if(false === $rowId) {
                $this->error = "edit contact failed";
                $this->rollback();
                return false;
            }

            $row["id"] = $rowId;

//            print_r($row);exit;

            $params = array(
                "crmContact",
                $row
            );
            tag("insert_dataModel_data", $params);

        }

        $this->commit();


        return true;
    }
    
}
