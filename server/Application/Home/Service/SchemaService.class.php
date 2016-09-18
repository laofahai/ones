<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 5/24/15
 * Time: 22:30
 */

namespace Home\Service;
use Common\Lib\RecursiveFileFilterIterator;
use Common\Lib\Schema;

class SchemaService {

    /*
     * 获取模块的所有数据表
     * **/
    static public function getSchemaByApp($app, $tables = []) {

        $cache_key = "schema/".$app;

        $schemas = (array)F($cache_key);
        if(DEBUG || !$schemas) {

            $schemas = [];

            $path = sprintf("%s%s/Schema", APP_PATH, ucfirst($app));
            if(!is_dir($path)) {
                return [];
            }
            foreach(new RecursiveFileFilterIterator($path, null, "yml") as $item) {
                $schemas = array_merge($schemas, (array)parse_yml($item));
            }

            // 需返回的数据表
            $tables = is_array($tables) ? $tables : [$tables];
            $tables = $tables ? $tables : (I("get.table") ? explode(".", I("get.table")) : array_keys($schemas));

            $schemas = Schema::parse($app, $schemas, $tables);

            F($cache_key, $schemas);
        }
        return $schemas;
    }

    /*
     * 遍历所有模块，获得相应数据表
     * */
    static public function getSchemaByTable($table, $app=null) {
        if($app) {
            $app_tables = self::getSchemaByApp($app);
            return $app_tables[$table];
        }
        foreach(AppService::$activeApps as $app) {
            $app_tables = self::getSchemaByApp($app);
            if($app_tables[$table]) {
                return $app_tables[$table];
            }
        }

        return [];

    }

}