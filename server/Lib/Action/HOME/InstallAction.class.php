<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 8/21/14
 * Time: 11:02
 */

ini_set("display_errors", 1);
error_reporting(E_ALL);
class InstallAction extends CommonAction {

    public function index() {

        switch($_POST['step']) {
            case "testDB":
                $this->testDB($_POST["data"]);
                break;
            case "importDB":
                $this->importDB($_POST["data"]);
                break;
            case "init":
                $this->initApp($_POST["data"]);
                break;
            case "clearData":
                $this->clearData($_POST["data"]);
                break;
        }

    }

    private function testDB($config) {
        sleep(2);
        $link = mysql_connect($config["db"]["dbhost"], $config["db"]["dbuser"], $config["db"]["dbpwd"]);
        if(!$link) {
            $this->error("testDbConnectFailed");
        }
    }

    private function importDB($config) {
        sleep(2);
    }

    private function initApp($config) {
        sleep(2);
    }

    private function clearData($config) {
        sleep(2);
    }

}