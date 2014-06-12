<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of ConfigAction
 *
 * @author nemo
 */
class ConfigAction extends CommonAction {
    
    public function index() {
        $tmp = parent::index(true);
        if(!$_GET["queryAll"]) {
            return $tmp;
        }
        
        array_push($tmp, array(
            "alias" => "remoteConfig.loaded",
            "value" => true
        ));
        array_push($tmp, array(
            "alias" => "DEBUG",
            "value" => APP_DEBUG
        ));
        $this->response($tmp);
    }
    
}
