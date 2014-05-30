<?php

error_reporting(E_ALL^E_NOTICE);

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

$_REQUEST = array_merge($_GET, $_POST, $_COOKIE);

//REST模式
define('MODE_NAME', 'rest');
define('__EXT__', 'json');
define("CTS", time()); // Current Timestamp
define("DS", DIRECTORY_SEPARATOR);
define("ENTRY_PATH", dirname(__FILE__));
define("APP_NAME", "ERP");

define("APP_DEBUG", true);

require './ThinkPHP/ThinkPHP.php';