<?php
$__ = array(
    
    'DB_TYPE'   => 'mysql', // 数据库类型
    'DB_HOST'   => '127.0.0.1', // 服务器地址
    'DB_NAME'   => 'ones_lab', // 数据库名
    'DB_USER'   => 'root', // 用户名
    'DB_PWD'    => '', // 密码
    'DB_PORT'   => 3306, // 端口
    'DB_PREFIX' => '', // 数据库表前缀 
    'DB_CHARSET'=> 'utf8', // 字符集
    'DB_DEBUG'  =>  TRUE, 
    
    'DEFAULT_M_LAYER' => 'Service',
    'SESSION_AUTO_START' =>false,
    
    'URL_ROUTER_ON'   => true,
    'URL_ROUTE_RULES' => array(),

    'URL_CASE_INSENSITIVE' => true,
    
    'DATA_CACHE_TYPE' => 'File',
    'DATA_CACHE_TIME' => 3600,

    'SESSION_OPTIONS' => array(
        'expire' => 600,
        'type'   => 'Db'
    )
    
);


/*
 * API QUERY/GET 使用Event
 * **/
if(substr($_SERVER['REQUEST_METHOD'], 0, 5) == "EVENT") {
    $__['DEFAULT_C_LAYER'] = "Event";
}


return $__;