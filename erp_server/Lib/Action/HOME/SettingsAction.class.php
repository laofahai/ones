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
class SettingsAction extends CommonAction {
    
    public function clearCache() {
        foreach($_POST["types"] as $k=> $p) {
            if("true" === $p) {
                clearCache($k);
            }
        }
    }
    
}
