<?php
$__ = array(
    'DB_PREFIX' => '', // 数据库表前缀
    'DB_CHARSET'=> 'utf8', // 字符集
    'DB_DEBUG'  =>  false,
    
    'DEFAULT_M_LAYER' => 'Service',
    'SESSION_AUTO_START' =>false,
    
    'URL_ROUTER_ON'   => true,
    'URL_ROUTE_RULES' => array(),

    'URL_CASE_INSENSITIVE' => false,
    
    'DATA_CACHE_TYPE' => 'File',
    'DATA_CACHE_TIME' => 3600,

    'SESSION_OPTIONS' => array(
        'expire' => 600,
        'type'   => 'Db'
    ),

    'SHOW_ERROR_MSG' => true,
    'TMPL_EXCEPTION_FILE' => ENTRY_PATH.'/Data/exception.tpl'
);
// 根据migration 设定数据库链接
$__phinx_config = \Symfony\Component\Yaml\Yaml::parse(file_get_contents(ENTRY_PATH.'/phinx.yml'));
if(defined('APPLICATION_ENV')) {
    $__env = APPLICATION_ENV;
} else {
    $__env = $__phinx_config['environments']['default_database'];
    define('APPLICATION_ENV', $__env);
}
$__phinx_db_config = $__phinx_config['environments'][$__env];
$__['DB_TYPE'] = $__phinx_db_config['adapter'];
$__['DB_HOST'] = $__phinx_db_config['host'];
$__['DB_NAME'] = $__phinx_db_config['name'];
$__['DB_USER'] = $__phinx_db_config['user'];
$__['DB_PWD'] = $__phinx_db_config['pass'];
$__['DB_PORT'] = $__phinx_db_config['port'];

/*
 * API QUERY/GET 使用Event
 * **/
if(substr($_SERVER['REQUEST_METHOD'], 0, 5) == "EVENT") {
    $__['DEFAULT_C_LAYER'] = "Event";
}

return $__;