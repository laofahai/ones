<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 14-7-16
 * Time: 21:40
 */

class ShipmentBuild extends CommonBuildAction {

    public function appInstall() {}

    public function appUninstall() {
        /*
         * 更新数据库
         * **/
        $sql = sprintf("DROP TABLE %sshipment", C("DB_PREFIX"));
        if(false === M()->execute($sql)) {
            $this->error("uninstall failed when update database");
            return false;
        }

        /*
         * 删除APP目录
         * **/
        $appPath = dirname(dirname(__FILE__));
        delDirAndFile($appPath);

        if(is_dir($appPath)) {
            $this->error("uninstall failed when remove the app dir");
        }

        /*
         * 其他扩展文件
         * @todo
         * **/

    }

    public function appEnable () {}

    public function appDisable() {}

}