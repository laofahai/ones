<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of LoginAction
 *
 * @author nemo
 */
class LoginAction extends CommonAction {
    
    public function insert() {
        $this->doLogin();
    }
    
    public function index() {
        $this->doLogout();
    }
    
    private function doLogout() {
        session_destroy();
    }
    
    private function doLogin() {
        if(IS_POST) {
            $user = D("UserRelation");
            $theUser = $user->getFullUserInfo($_REQUEST["username"], "username");
            if(!$theUser or $theUser["status"] < 1) {
                $this->response(array(
                    "error" => 1,
                    "msg"   => L("user_not_exists")
                ));return;
                //@todo 禁用用户
            }

            if($theUser["password"] !== getPwd($_REQUEST["password"])) {
                $this->response(array(
                    "error" => 1,
                    "msg"   => L("password_not_verified")
                ));return;
            }

            unset($theUser["password"]);
            $_SESSION["user"] = $theUser;
            $this->response(array(
                "error" => 0,
                "sessionHash" => session_id()
            ));
        } else {
            $this->response(array(
                "error" => 1,
                "msg"   => L("invlid")
            ));
        }
    }
    
}
