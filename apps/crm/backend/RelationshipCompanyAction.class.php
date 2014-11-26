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

}
