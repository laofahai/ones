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
    
    //清除缓存
    public function clearCache() {
        foreach($_POST["types"] as $k=> $p) {
            if("true" === $p) {
                clearCache($k);
            }
        }
    }
    
    //数据备份
    public function dataBackup() {
        $options = array();
        if($_POST["options"]["send_email"]) {
            array_push($options, "sendmail");
        }
        if($_POST["options"]["packit"]) {
            array_push($options, "zip");
        }
        if($_POST["options"]["autodelete"]) {
            array_push($options, "autodelete");
        }
        $rs = DBBackup($options);
//        print_r($options);
//        var_dump($rs);
        echo true === $rs ? "success" : $rs;
    }


    
}
