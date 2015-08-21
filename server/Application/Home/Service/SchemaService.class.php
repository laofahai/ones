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
    static public function getSchemaByApp($app) {
        $cache_key = "schema/".$app;

        $schemas = (array)S($cache_key);
        if(DEBUG || !$schemas) {
            $path = sprintf("%s%s/Schema", APP_PATH, ucfirst($app));

            foreach(new RecursiveFileFilterIterator($path, null, "yml") as $item) {
                $schemas = array_merge($schemas, (array)parse_yml($item));
            }

            // 需返回的数据表
            $tables = I("get.table") ? explode(".", I("get.table")) : array_keys($schemas);

            $schemas = Schema::parse($app, $schemas, $tables);

            S($cache_key, $schemas);
        }
        return $schemas;
    }

}