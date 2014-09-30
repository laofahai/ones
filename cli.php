<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 9/29/14
 * Time: 16:50
 */


error_reporting(1);
define('MODE_NAME', 'cli');

define("CTS", time()); // Current Timestamp
define("DS", DIRECTORY_SEPARATOR);

define("ROOT_PATH", dirname(__FILE__));
define("ENTRY_PATH", ROOT_PATH."/server");


define("APP_NAME", "ONES");
define("APP_DEBUG", true);
define("APP_PATH", "./server/");

require ROOT_PATH.'/server/ThinkPHP/ThinkPHP.php';