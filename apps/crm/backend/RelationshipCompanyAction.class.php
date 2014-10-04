<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of RelationshipCompanyAction
 *
 * @author nemo
 */
class RelationshipCompanyAction extends CommonAction {
    
    protected $relation = true;

    protected $indexModel = "RelationshipCompanyView";
    
    public function _filter(&$map) {
        if($_GET["typeahead"]) {
            $this->relation = false;
            $map["_string"] = str_replace("__", strtoupper($_GET["typeahead"]), "name LIKE '%__%' OR pinyin LIKE '%__%'");
        }
        
        $map["deleted"] = 0;
    }

    /*
     *
     * **/
    protected function pretreatment() {

        if(!$_POST["pinyin"]) {
            $_POST["pinyin"] = Pinyin($_POST["name"]);
        }

        if(!$_GET["id"]) {
            $_POST["user_id"] = getCurrentUid();
            $_POST["dateline"] = CTS;
        }

        $tmp["rows"] = array();

        foreach($_POST["rows"] as $k=> $row) {
            if(count($row)) {
                $tmp["rows"][] = $row;
            } else {
                unset($_POST["rows"][$k]);
            }
        }

        $_POST["rows"] = $tmp["rows"];

    }

    public function index() {
        $this->dataModelAlias = "crmBaseInfo";
        return parent::index();
    }
    
    public function insert() {

        $this->pretreatment();

        $model = D("RelationshipCompany");

        $id = $model->newCompany($_POST, $_POST["rows"]);

        if(!$id) {
            $this->response($model->getError());
        } else {
//            $_POST["extraInfo"]["id"] = $id;
//            $params = array(
//                "crmBaseInfo",
//                $_POST["extraInfo"]
//            );
//
////            print_r($_POST["extraInfo"]);
//
//            tag("insert_dataModel_data", $params);

//            foreach($_POST["rows"] as $row) {
//                $params = array(
//                    "crmContact",
//                    $row
//                );
//                tag("insert_dataModel_data", $params);
//            }
        }
    }

    public function update() {

        $this->pretreatment();

        $model = D("RelationshipCompany");
        $rs = $model->editCompany($_POST, $_POST["rows"], $_GET["id"]);

        if(!$rs) {
            $this->response($model->getError());
        }
    }

    public function read() {
        $this->dataModelAlias = "crmBaseInfo";
        $data = parent::read(true);
        if(!$_GET["includeRows"]) {
            $this->response($data);
            return;
        }

        $model = D("RelationshipCompanyLinkman");
        $rows = $model->where("relationship_company_id=".$_GET["id"])->select();

        $params = array(
            $rows,
            "crmContact",
            false,
            false
        );

        tag("assign_dataModel_data", $params);

        $data["rows"] = $params[0];

        $this->response($data);
    }
    
//    public function index() {
//        $data = parent::index(true);
//        foreach($data as $k=>$v) {
////            $data[$k]["name"] = $_REQUEST["typeahead"] ? $v["name"].sprintf('<span>%s</span>', $v["pinyin"]) : $v["name"];
//        }
//        
//        $this->response($data);
//    }
    
}
