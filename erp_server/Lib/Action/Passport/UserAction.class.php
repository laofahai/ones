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
        if($_POST["usergroup"]) {

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

    /**
     * @todo relation 自动更新
     * 更新用户组
     */
    public function _after_update() {
        $this->updateUserGroup();
    }

    public function _after_insert() {
        $this->updateUserGroup();
    }

    private function updateUserGroup() {
        if($_POST["usergroup"]) {
            $id = $_POST["id"];
            $usergroup = is_array($_POST["usergroup"]) ? $_POST["usergroup"] : explode(",", $_POST["usergroup"]);
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

        if($id == $this->user["id"]) {
            /**
             * 更新SESSION
             */
            $user = D("UserRelation");
            $theUser = $user->getFullUserInfo($_REQUEST["id"]);
            unset($theUser["id"]);
            $_SESSION["user"] = $theUser;
        }
    }
    
    public function read() {
        $item = parent::read(true);
        unset($item["password"]);
        $this->response($item);
    }
}
