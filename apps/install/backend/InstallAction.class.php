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
        "/server/Conf",
        "/server/Runtime",
        "/server/Data",
        "/server/Data/Backup",
        "/server/Data/logs",
        "/server/Data/Updates",
        "/uploads",
        "/uploads/Avatars"
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
            case "checkPermission":
            default:
                $this->checkDirPermission();
                break;
        }

    }

    private function connectDB($config) {
        $link = mysqli_connect($config["db"]["dbhost"], $config["db"]["dbuser"], $config["db"]["dbpwd"]); 

        if (mysqli_connect_errno()) {
            $this->error("testDbConnectFailed");
            return false;
        }
        
        $selected = mysqli_select_db($link, $config["db"]["dbname"]);

        if(!$selected) {
            $sql = "CREATE DATABASE IF NOT EXISTS `{$config["db"]["dbname"]}` DEFAULT CHARSET utf8 COLLATE utf8_general_ci";
            mysqli_query($link, $sql);
            mysqli_select_db($link, $config["db"]["dbname"]);
        }

        mysqli_query($link, "SET NAMES UTF8");

        return $link;
    }

    private function testDB($config) {
        if(!is_writable(ENTRY_PATH."/Conf")) {
            $this->error("configFileUnwriteable");
            return false;
        }

        $configContent = file_get_contents(ENTRY_PATH."/Conf/config.sample.php");
        $search = array(
            "[db_host]",
            "[db_name]",
            "[db_user]",
            "[db_port]",
            "[db_pre]",
            "[db_pwd]",
            "[api_key]",
            "[secret_key]"
        );
        $replace = array(
            $config["db"]["dbhost"],
            $config["db"]["dbname"],
            $config["db"]["dbuser"],
            $config["db"]["dbport"] ? $config["db"]["dbport"] : 3306,
            $config["db"]["dbpre"],
            $config["db"]["dbpwd"],
            $config["db"]["api_key"],
            $config["db"]["secret_key"]
        );

        $configContent = str_replace($search, $replace, $configContent);
        file_put_contents(ENTRY_PATH."/Conf/config.php", $configContent);

        return $this->connectDB($config);
    }

    private function importDB($config) {

        $rs = importSQL(ROOT_PATH."/apps/install/data/install.sql");
        if(true !== $rs) {
            $this->error($rs[0]);return;
        }

    }

    private function initApp($config) {

        $model = D("User");

        $data = $config["admin"];
        $data["status"] = 1;
        $data["password"] = getPwd($data["password"]);
        $data["department_id"] = 0;
        $uid = $model->add($data);

        $m = M();
        $sql = "INSERT INTO `%sauth_group_access`(uid, group_id)VALUES(%d, 1)";
        $sql = sprintf($sql, $config["db"]["dbpre"], $uid);
        $m->execute($sql);

        $authNodesModel = D("AuthRule");
        $nodeIds = $authNodesModel->field("id")->select();
        $nodeIds = getArrayField($nodeIds, "id");

        $authedRule = D("AuthGroupRule");
        foreach($nodeIds as $node) {
            $authedRule->add(array(
                "group_id" => 1,
                "rule_id"  => $node,
                "flag"     => 0
            ));
        }

    }

    /*
     * @todo 清除安装文件
     * **/
    private function clearData($config) {
        file_put_contents($this->installLockFile, CTS);

        $installPath = ROOT_PATH."/apps/install";

        clearCache(0);
        clearCache(1);
        clearCache(2);
        clearCache(3);

        delDirAndFile($installPath);
        unlink(ROOT_PATH."/install.html");
        rmdir($installPath);
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