<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of PassportAction
 *
 * @author 志鹏
 */
class PassportAction extends CommonAction {
    
    public function userLogin() {
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
    
    public function Profile() {
        
        if(IS_POST) {
            if(!$_POST["password"]) {
                unset($_POST["password"]);
            } else {
                $_POST["password"] = getPwd($_POST["password"]);
            }
            $model = D("UserRelation");
            $model->where("id=".$this->user["id"])->save($_POST);
            
            $theUser = $model->relation(true)->find($this->user["id"]);
            $this->user = $_SESSION["user"] = $theUser;
//            print_r($_SESSION["user"]);exit;
//            echo $model->getLastSql();exit;
            if($_POST["password"]) {
                $this->logout();
            } else {
                $this->redirect("/HOME/Passport/Profile");
            }
            
            return;
        }
//        print_r($_SESSION["user"]);exit;
        $data = $this->user;
        unset($data["password"]);
        import("@.Form.Form");
        $form = new Form("Passport", "Profile");
        $this->assign("FormHTML", $form->makeForm(null, $data));
        $this->display();
    }
    
    
    
    public function logout() {
        session_destroy();
        
    }
    
}

?>
