<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of SettingsAction
 *
 * @author nemo
 */
class ClearCacheAction extends CommonAction {

    protected $singleAction = true;
    
    //清除缓存
    public function insert() {
        foreach($_POST["types"] as $k=> $p) {
            if($p) {
                clearCache($k);
            }
        }
    }

}
