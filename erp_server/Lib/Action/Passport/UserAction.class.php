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
    
    /**
     * @todo relation 自动更新
     */
    public function _after_update() {
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
    }
    
    public function read() {
        $item = parent::read(true);
        unset($item["password"]);
        $this->response($item);
    }
}
