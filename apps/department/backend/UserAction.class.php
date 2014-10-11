<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of UserAction
 *
 * @author nemo
 */
class UserAction extends CommonAction {
    
    protected $relation = true;
    protected $indexModel = "UserRelation";
    protected $readModel = "UserRelation";
    protected $insertModel = "UserRelation";
    protected $updateModel = "UserRelation";
    
    protected function pretreatment() {
        switch($this->_method) {
            case "post":
                $_POST["password"] = getPwd($_POST["password"]);
//                $_POST["status"] = 1;
                break;
            case "put":
                if($_POST["password"]) {
                    $_POST["password"] = getPwd($_POST["password"]);
                } else {
                    unset($_POST["password"]);
                }
                break;
        }
    }

    public function update() {
        if(!$_GET['editMine']) {
            return parent::update();
        }
        $this->pretreatment();
        $model = D("User");
        $model->where("id=".$this->user["id"])->save($_POST);
    }

    public function insert() {
        $id = parent::insert(true);
        $this->updateUserGroup($id);
    }

    /**
     * @todo relation 自动更新
     * 更新用户组
     */
    public function _after_update() {
        $this->updateUserGroup();
    }

    private function updateUserGroup($id=null) {
        if($_POST["group_ids"]) {
            $id = $_POST["id"] ? $_POST["id"] : $id;
            $usergroup = is_array($_POST["group_ids"]) ? $_POST["group_ids"] : explode(",", $_POST["group_ids"]);
            $model = D("AuthGroupAccess");
            $model->where("uid=".$id)->delete();
            foreach($usergroup as $g) {
                $data = array(
                    "uid" => $id,
                    "group_id" => $g
                );

                $model->add($data);
            }
        }
    }
    
    public function read() {
        if("0" === $_GET["id"] && (!$_GET["email"] && !$_GET["username"])) {
            return;
        }

        $item = parent::read(true);
        unset($item["password"]);
        $this->response($item);
    }
}
