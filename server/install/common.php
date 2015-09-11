<?php

/*
 * 发送终止信号
 * */
function send_exit_single($msg = '') {
    echo $msg;
    echo "\nQuit\n";
};

/*
 * 检测环境
 * */
function check_env() {
    // php
    if(version_compare(PHP_VERSION,'5.5.9','<')) {
        send_exit_single('php version need >= 5.5.9');
        return;
    }
    // pdo
    if(!class_exists('PDO')) {
        send_exit_single('need php-pdo module enabled');
        return;
    }

    return true;
}

/*
 * 检查adapter是否合法
 * */
function check_input_for_adapter($adapter) {
    $adapter = $adapter ? strtolower($adapter) : 'mysql';
    $supported_adapter = ['mysql'];
    if(!in_array($adapter, $supported_adapter)) {
        return 'Unsupported adapter: '. $adapter;
    }

    return true;
}

/*
 * 测试数据库链接
 * */
function check_db_connection($db_config) {
    $dsn = sprintf('mysql:host=%s;dbname=%s;port=%s', $db_config['host'], $db_config['name'], $db_config['port']);

    try {
        $pdo = new PDO($dsn, $db_config['user'], $db_config['pass']);
    } catch (PDOException $e) {
        send_exit_single($e->getMessage());
        return;
    }

    $mysql_version = $pdo->getAttribute(PDO::ATTR_SERVER_VERSION);
    if(version_compare($mysql_version, '5.6.5', '<')) {
        send_exit_single('need mysql version >= 5.6.5');
        return;
    }

    return true;
}