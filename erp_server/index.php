<?php

define('MODE_NAME', 'rest');
define('__EXT__', 'json');
define("CTS", time()); // Current Timestamp
define("DS", DIRECTORY_SEPARATOR);
define("ENTRY_PATH", dirname(__FILE__));
define("APP_NAME", "ERP");

define("APP_DEBUG", true);

require './ThinkPHP/ThinkPHP.php';