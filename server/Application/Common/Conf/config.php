<?php

// 应用数据库环境
define('DB_ENVIRONMENT', 'development');

$__ = array(

    'RESPONSE_WITH_DEBUG_INFO' => true,

    'DB_PREFIX' => '', // 数据库表前缀
    'DB_CHARSET'=> 'utf8', // 字符集
    'DB_DEBUG'  =>  false,

    'DEFAULT_C_LAYER' => 'Controller',
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
    'LOG_LEVEL'  =>'EMERG,ALERT,CRIT,ERR,WARN,NOTICE,INFO,DEBUG,SQL',
    'LOG_PATH' => APP_PATH.'Data/Log/___',

    'SHOW_ERROR_MSG' => true,
    'SHOW_PAGE_TRACE' => false,
    'TMPL_EXCEPTION_FILE' => ENTRY_PATH.'/Data/exception.tpl',

    'DB_DSN' => 'mysql:host=not.a.really.host;dbname=not_a_really_database',
//    'DB_HOST' => '127.0.0.1',
//    'DB_NAME' => '',
//    'DB_USER' => '',
//    'DB_PWD'  => '',
//    'DB_PORT' => '',
//    'DB_DSN'  => ''
);

return $__;