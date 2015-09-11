<?php

define('ENTRY_PATH', dirname(dirname(__FILE__)));
define('INSTALL_PATH', ENTRY_PATH.'/install');

require ENTRY_PATH."/vendor/autoload.php";
require ENTRY_PATH."/migrations/0_install.php";
require INSTALL_PATH.'/common.php';

echo file_get_contents(INSTALL_PATH.'/Guide.md');
echo "\n";

// 检测基本环境
if(!check_env()) {
    return;
}

$db_config = [
    'adapter' => 'mysql',
    'host'    => '127.0.0.1',
    'port'    => '3306',
    'user'    => '',
    'pass'    => '',
    'name'    => 'install_test'
];

foreach($db_config as $k=>$v) {
    $need_key = $k;
    if($v) {
        $need_key .= " (default is {$v})";
    }
    printf('Your database %s:', $need_key);

    $input_value = trim(fgets(STDIN));
    $check_func = sprintf('check_input_for_'.$k);
    if(function_exists($check_func)) {
        $check_result = $check_func($input_value);
        if(true !== $check_result) {
            send_exit_single($check_result);
            return;
        } else {
            $db_config[$k] = $input_value ? $input_value : $v;
        }
    } else {
        $db_config[$k] = $input_value ? $input_value : $v;
    }
}

// 检测数据库链接
if(!check_db_connection($db_config)) {
    return;
}

// 同步数据表结构
$migrate = new Install(0);
$migrate->up();