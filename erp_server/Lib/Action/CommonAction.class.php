<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of CommonAction
 *
 * @author Administrator
 */
class CommonAction extends RestAction {
    
    public function __construct() {
        parent::__construct();
        
        import("@.ORG.Auth");
        
        if($_REQUEST["sessionHash"]) {
            session_id($_GET["sessionhash"]);
        }
        
        if(!$this->isLogin()) {
            header('HTTP/1.1 401 Unauthorized');
        }
    }
    
    public function isLogin() {
        return $_SESSION["user"]["id"] ? 1 : 0;
    }
    
    
    
}
