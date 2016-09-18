<?php
/**
 * Created by PhpStorm.
 * User: laofahai <335454250@qq.com>
 * Date: 9/18/16
 * Time: 09:45
 */

namespace Common\Behaviors;


use Think\Behavior;

class DynamicConfigBehavior extends Behavior
{

    public function run(&$params) {

        if(true === APP_DEBUG) {
            define('APPLICATION_ENV', 'development');
        }

        switch(APP_DEBUG) {
            case true:
                $_env = 'development';
                break;
            case 1:
                $_env = 'testing';
                break;
            default:
                $_env = 'production';
                break;
        }

        define('APPLICATION_ENV', $_env);

        // 根据migration 设定数据库链接
        $__phinx_config = \Symfony\Component\Yaml\Yaml::parse(file_get_contents(ENTRY_PATH.'/phinx.yml'));
        if(defined('APPLICATION_ENV')) {
            $__env = APPLICATION_ENV;
        } else {
            $__env = $__phinx_config['environments']['default_database'];
            define('APPLICATION_ENV', $__env);
        }
        $__phinx_db_config = $__phinx_config['environments'][$__env];

//$__['DB_TYPE'] = $__phinx_db_config['adapter'];
        $__['DB_HOST'] = $__phinx_db_config['host'];
        $__['DB_NAME'] = $__phinx_db_config['name'];
        $__['DB_USER'] = $__phinx_db_config['user'];
        $__['DB_PWD'] = $__phinx_db_config['pass'];
        $__['DB_PORT'] = $__phinx_db_config['port'];

        $__['DB_TYPE'] = 'PDO';
        $__['DB_DSN'] = sprintf(
            '%s:host=%s;port=%d;dbname=%s',
            $__phinx_db_config['adapter'],
            $__phinx_db_config['host'],
            $__phinx_db_config['port'],
            $__phinx_db_config['name']
        );

        /*
         * API QUERY/GET 使用Event
         * **/
        if(substr($_SERVER['REQUEST_METHOD'], 0, 5) == "EVENT") {
            $__['DEFAULT_C_LAYER'] = "Event";
        }

        C($__);

    }
    
}