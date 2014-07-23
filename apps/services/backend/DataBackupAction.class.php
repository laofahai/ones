<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 14-7-12
 * Time: 21:44
 */

class DataBackupAction extends CommonAction {

    protected $singleAction = true;

    //数据备份
    public function insert() {
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