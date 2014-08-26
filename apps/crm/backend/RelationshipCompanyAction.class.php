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
        $tmp["baseInfo"] = array(
            "name" => $_POST["name"],
            "pinyin" => Pinyin($_POST["name"]),
            "group_id" => $_POST["group_id"],
            "discount" => $_POST["discount"],
            "address"  => $_POST["address"],
            "memo"     => $_POST["memo"]
        );

        if(!$_GET["id"]) {
            $tmp["baseInfo"]["user_id"] = getCurrentUid();
            $tmp["baseInfo"]["dateline"] = CTS;
        }

        $tmp["rows"] = array();

        foreach($_POST["rows"] as $k=> $row) {
            if(count($row)) {
                $tmp["rows"][] = $row;
            } else {
                unset($_POST["rows"][$k]);
            }

        }

        $_POST = $tmp;
    }
    
    public function insert() {
        $this->pretreatment();

        $model = D("RelationshipCompany");
        $rs = $model->newCompany($_POST["baseInfo"], $_POST["rows"]);
        if(!$rs) {
            $this->response($model->getError());
        }
    }

    public function update() {
        $this->pretreatment();

        $model = D("RelationshipCompany");
        $rs = $model->editCompany($_POST["baseInfo"], $_POST["rows"], $_GET["id"]);
        if(!$rs) {
            $this->response($model->getError());
        }
    }

    public function read() {
        $data = parent::read(true);
        if(!$_GET["includeRows"]) {
            $this->response($data);
            return;
        }

        $model = D("RelationshipCompanyLinkman");
        $tmp["rows"] = $model->where("relationship_company_id=".$_GET["id"])->select();

        $this->response($tmp);
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
