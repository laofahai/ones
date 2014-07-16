<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 14-7-16
 * Time: 21:39
 */

abstract class CommonBuildAction {

    protected $appConfig;

    protected $error;

    public function __construct($appConfig) {
        $this->appConfig = $appConfig;
    }

    /*
     * APP安装
     * 子类需实现此方法
     * **/
    abstract public function appInstall();

    /*
     * APP卸载
     * 子类需实现此方法
     * **/
    abstract public function appUninstall();

    /*
     * 卸载结束后的回调方法
     * @param $result boolean
     * **/
    public function afterAppUninstall($result) {
        if($result && !$this->error) {
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