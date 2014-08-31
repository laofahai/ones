<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 8/21/14
 * Time: 11:02
 */

class InstallAction extends CommonAction {

    protected $installLockFile;

    protected $writeableDirs = array(
        "/apps",
        "/server/Conf/config.php",
        "/server/ones.sql",
        "/server/Runtime",
        "/server/Data",
        "/server/Data/apps",
        "/server/Data/Avatars",
        "/server/Data/Backup",
        "/server/Data/logs",
        "/server/Data/Updates"
    );

    public function __construct() {
        if(!$_POST) {
            $_POST = array_merge((array)$_POST, json_decode(file_get_contents('php://input'), true));
        }
        $this->installLockFile = ENTRY_PATH."/Data/install.lock";
    }

    public function index() {

        if(is_file($this->installLockFile)) {
            $this->error("installLocked");
            return;
        }

        switch($_POST['step']) {
            case "checkPermission":
                $this->checkDirPermission();
                break;
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

    private function connectDB($config) {
        $link = mysql_connect($config["db"]["dbhost"], $config["db"]["dbuser"], $config["db"]["dbpwd"]);

        if(!$link) {
            $this->error("testDbConnectFailed");
            return false;
        }

        $selected = mysql_select_db($config["db"]["dbname"]);

        if(!$selected) {
            $sql = "CREATE DATABASE IF NOT EXISTS `{$config["db"]["dbname"]}` DEFAULT CHARSET utf8 COLLATE utf8_general_ci";
            $rs = mysql_query($sql);
            echo $sql;
            var_dump($rs);
            mysql_select_db($config["db"]["dbname"]);
        }

        mysql_query("SET NAMES UTF8");

        return $link;
    }

    private function testDB($config) {
        $configFile = ENTRY_PATH."/Conf/config.php";
        if(!is_writable($configFile)) {
            $this->error("configFileUnwriteable");
            return false;
        }

        $configContent = file_get_contents(ENTRY_PATH."/Conf/config.php");
        $search = array(
            "[service_api_key]",
            "[db_host]",
            "[db_name]",
            "[db_user]",
            "[db_port]",
            "[db_pre]",
            "[db_pwd]"
        );
        $replace = array(
            md5($_SERVER["SERVER_NAME"].CTS.rand(1,5000)),
            $config["db"]["dbhost"],
            $config["db"]["dbname"],
            $config["db"]["dbuser"],
            $config["db"]["dbport"] ? $config["db"]["dbport"] : 3306,
            $config["db"]["dbpre"],
            $config["db"]["dbpwd"],
        );
        $configContent = str_replace($search, $replace, $configContent);
        file_put_contents(ENTRY_PATH."/Conf/config.php", $configContent);

        return $this->connectDB($config);
    }

    private function importDB($config) {
        $link = $this->connectDB($config);

        $sqls = file_get_contents(ENTRY_PATH."/ones.sql");
        $sqls = explode("\n\n", $sqls);
//        print_r($sqls);exit;
        foreach($sqls as $sql) {
            $sql = trim(str_replace("[PREFIX]", $config["db"]["dbpre"], $sql));
            if(!$sql) {
                continue;
            }
            if(!mysql_query($sql, $link)) {
                $this->error($sql);return;
            }
        }
    }

    private function initApp($config) {

        $model = D("User");

        $data = $config["admin"];
        $data["status"] = 1;
        $data["password"] = getPwd($data["password"]);
        $data["department_id"] = 0;
        $uid = $model->add($data);

        $sql = "INSERT INTO `%sauth_group_access`(uid, group_id)VALUES(%d, 1)";
        $sql = sprintf($sql, $config["db"]["dbpre"], $uid);
        $model->execute($sql);
    }

    /*
     * @todo 清除安装文件
     * **/
    private function clearData($config) {
        file_put_contents($this->installLockFile, CTS);
        sleep(2);
    }

    private function checkDirPermission() {
        $lists = array();
        $hasUnwriteAble = false;
        foreach($this->writeableDirs as $file) {
            $writeable = is_writeable(ROOT_PATH.$file);
            if(!$writeable) {
                $hasUnwriteAble = true;
            }
            $lists[] = array(
                "dir" => $file,
                "writeable" => $writeable
            );
        }

        $this->response(array(
            "hasUnwriteable" => $hasUnwriteAble,
            "lists" => $lists
        ));
    }

}