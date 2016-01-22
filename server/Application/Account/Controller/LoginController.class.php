<?php

namespace Account\Controller;
use Common\Controller\BaseRestController;

class LoginController extends BaseRestController {

    protected $not_belongs_to_company = true;
    
    public function on_post() {
        $user = D("Account/UserInfo");
        $result = $user->authenticate(
                I("post.company_sign_id"),
                I("post.username"),
                I("post.password")
        );
        if(true === $result) {
            return $this->response(array(
                'token'=> session_id()
            ));
        }
        
        switch($result) {
            case -1:
                $error = __("account.Company Not Exists");
                break;
            case -2:
                $error = __("account.User Not Exists");
                break;
            case -3:
                $error = __("account.Password doesn't match");
                break;
        }
        
        $this->error($error);
    }
    
}