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
    
    private function doLogin() {
        if(IS_POST) {
            $user = D("UserRelation");
            $theUser = $user->relation(true)->getByUsername($_POST["username"]);
            if($theUser["status"] < 1) {
                $this->response(array(
                    "error" => 1,
                    "msg"   => L("user_not_exists")
                ));
                //@todo 禁用用户
            }
            
            if(!$theUser or $theUser["password"] !== getPwd($_POST["password"])) {
                $this->response(array(
                    "error" => 1,
                    "msg"   => L("password_not_verified")
                ));
            }
            
            foreach($theUser["groups"] as $g) {
                $theUser["group_ids"][] = $g["id"];
            }
            
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
