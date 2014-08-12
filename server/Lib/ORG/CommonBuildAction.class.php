<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 14-7-16
 * Time: 21:39
 */

class CommonBuildAction {

    protected $appConfig;

    protected $appPath;

    protected $error;

    public function __construct($appConfig) {
        $this->appConfig = $appConfig;
        $this->appPath = ROOT_PATH."/apps/".$this->appConfig["alias"];
        if(!$appConfig["alias"]) {
            $this->error("");
        }
    }

    /*
     * APP安装
     * 子类可覆盖
     * **/
    public function appInstall($alias) {
        $installSql = sprintf("%s/apps/%s/data/sqls/install.sql", ROOT_PATH, $alias);
        if(is_file($installSql)) {
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
            importSQL($uninstallSql);
        }

        /*
         * 删除APP目录
         * **/
        force_rmdir($this->appPath);
//        rmdir($this->appPath);

        if(is_dir($this->appPath)) {
            $this->error("uninstall failed when remove the app dir");
        }

        return true;

        /*
         * 其他扩展文件
         * @todo
         * **/
    }

    /*
     * 默认APP更新方法
     * **/
    public function appUpgrade() {
        $upgradeSql = sprintf("%s/apps/%s/data/sqls/upgrade.sql", ROOT_PATH, $this->appConfig["alias"]);
        if(is_file($upgradeSql)) {
            importSQL($upgradeSql);
        }

        return true;
    }

    public function afterAppUpgrade() {
        if(!$this->error) {
            D("Apps")->where(array(
                "alias" => $this->appConfig["alias"]
            ))->save(array(
                "version" => $this->appConfig["version"]
            ));
        }
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

    /*
     * 插入工作流节点
     * **/
    final protected function appInsertWorkflow() {

    }


    final protected function error($msg) {
        $this->error = $msg;
    }

    final public function getError() {
        return $this->error;
    }


}