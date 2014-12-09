<?php

header("Access-Control-Allow-Origin: *");

/**
 * CORS非简单跨域请求第一次讯问是否支持跨域
 */
if($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, Accept, X-Requested-With, sessionhash");
    header("Access-Control-Max-Age", 3600);
    exit;
}

//REST模式
define('MODE_NAME', 'rest');
define('__EXT__', 'json');
define("CTS", time()); // Current Timestamp
define("DS", DIRECTORY_SEPARATOR);

define("ROOT_PATH", dirname(__FILE__));
define("ENTRY_PATH", ROOT_PATH."/server");

define("APP_NAME", "ONES");
define("APP_DEBUG", true);
define("APP_PATH", "./server/");

//session_cache_limiter('private');
//session_cache_expire(10);
//ini_set('session.cookie_lifetime', 600);
//ini_set('session.gc_maxlifetime', 600);

if(APP_DEBUG) {
    error_reporting(E_ALL^E_NOTICE^E_WARNING);
} else {
    error_reporting(0);
}

//修正POST不能正确获取数据问题
if(in_array($_SERVER["REQUEST_METHOD"], array("POST", "PUT")) && !$_POST) {
    try{
        $_POST = json_decode(file_get_contents("php://input"), true);
        $_REQUEST = array_merge($_GET, $_POST);
    } catch(Exception $e) {}

}

if(!$_REQUEST["installing"] && (!is_file(ENTRY_PATH."/Data/install.lock") or !is_file(ENTRY_PATH."/Conf/config.php"))) {
    header("Location:install.html");
}

require './server/ThinkPHP/ThinkPHP.php';