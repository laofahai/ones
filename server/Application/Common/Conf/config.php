<?php

// 应用数据库环境
define('DB_ENVIRONMENT', 'development');

$__ = array(

    'RESPONSE_WITH_DEBUG_INFO' => true,

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

    'URL_MODEL' => 3,
    'URL_HTML_SUFFIX' => '',

    'LOG_RECORD' => true,
    'LOG_TYPE'   =>  'File',
    'LOG_LEVEL'  =>'EMERG,ALERT,CRIT,ERR',
    'LOG_PATH' => APP_PATH.'/Data/Log/___',

    'SHOW_ERROR_MSG' => true,
    'SHOW_PAGE_TRACE' => true,
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

return $__;