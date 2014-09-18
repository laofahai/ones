<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of AuthGroupAction
 *
 * @author nemo
 */
class AuthGroupAction extends CommonAction {
    
    public function _after_delete() {
        //删除用户组对应权限
        $model = D("AuthGroupRule");
        $model->where(array(
            "group_id" => array("IN", $_REQUEST["id"])
        ))->delete();
    }


    
}
