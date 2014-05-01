<?php

/**
 * 允许跨域请求
 */

header("Access-Control-Allow-Origin: *");

if($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, Accept,X-Requested-With, sessionhash");
    header("Access-Control-Max-Age", 3600);
    exit;
}


define('MODE_NAME', 'rest');
define('__EXT__', 'json');
define("CTS", time()); // Current Timestamp
define("DS", DIRECTORY_SEPARATOR);
define("ENTRY_PATH", dirname(__FILE__));
define("APP_NAME", "ERP");

define("APP_DEBUG", true);

require './ThinkPHP/ThinkPHP.php';