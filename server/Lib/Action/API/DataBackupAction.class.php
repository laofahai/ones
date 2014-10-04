<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 10/3/14
 * Time: 22:33
 */

class DataBackupAction extends CommonCLIAction {

    public function index() {
        DBBackup(array(
            "zip", "sendmail"
        ));
    }

}