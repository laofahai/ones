<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 14-7-16
 * Time: 21:39
 */

abstract class CommonBuildAction {

    protected $appConfig;

    protected $appPath;

    protected $error;

    public function __construct($appConfig) {
        $this->appConfig = $appConfig;
        $this->appPath = ROOT_PATH."/apps/".$this->appConfig["alias"];
        if(!$appConfig["alias"]) {
            exit("1");
        }
    }

    /*
     * APP安装
     * 子类可覆盖
     * **/
    public function appInstall($alias) {
        $installSql = sprintf("%s/apps/%s/data/sqls/install.sql", ROOT_PATH, $alias);
        if(is_file($installSql)) {
            $sql = file_get_contents($installSql);
            $sql = str_replace("[PREFIX]", C("DB_PREFIX"), $sql);
            file_put_contents($installSql, $sql);

            importSQL($installSql);
        }

        return true;
    }

    /*
     * APP卸载
     * 子类可覆盖
     * **/
    public function appUninstall() {

        /*
         * 更新数据库
         * **/
        $uninstallSql = sprintf("%s/apps/%s/data/sqls/uninstall.sql", ROOT_PATH, $this->appConfig["alias"]);
        if(is_file($uninstallSql)) {
            $sql = file_get_contents($uninstallSql);
            $sql = str_replace("[PREFIX]", C("DB_PREFIX"), $sql);
            file_put_contents($uninstallSql, $sql);
            importSQL($uninstallSql);
        }

        /*
         * 删除APP目录
         * **/
        force_rmdir($this->appPath);
//        rmdir($this->appPath);

        if(is_dir($this->appPath)) {
//            $this->error("uninstall failed when remove the app dir");
        }

        return true;

        /*
         * 其他扩展文件
         * @todo
         * **/
    }

    /*
     * 安装结束后的回调方法
     * @param $result boolean
     * **/
    public function afterAppInstall() {
        if(!$this->error) {
            D("Apps")->add(array(
                "alias" => $this->appConfig["alias"],
                "version" => $this->appConfig["version"],
                "dateline" => CTS,
                "status"   => 0
            ));
        }
    }

    /*
     * 卸载结束后的回调方法
     * @param $result boolean
     * **/
    public function afterAppUninstall() {
        if(!$this->error) {
            D("Apps")->where(array(
                "alias" => $this->appConfig["alias"]
            ))->delete();
        }
    }

    /*
     * 默认APP更新方法
     * **/
    public function upgrade() {}

    /*
     * 默认APP启用方法
     * 仅涉及更新apps表中状态
     * **/
    public function appEnable() {
        $model = D("Apps");
        return false !== $model->where(array(
            "alias" => $this->appConfig["alias"]
        ))->save(array(
            "status" => 1
        ));
    }

    /*
     * 默认APP禁用方法
     * 仅涉及更新apps表中状态
     * **/
    public function appDisable() {
        $model = D("Apps");
        return false !== $model->where(array(
            "alias" => $this->appConfig["alias"]
        ))->save(array(
            "status" => 0
        ));
    }


    final protected function error($msg) {
        $this->error = $msg;
    }

    final public function getError() {
        return $this->error;
    }


}