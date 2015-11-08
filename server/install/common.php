<?php
/*
 * 所有应用列表
 * */
$apps = [
    'product' => [
        'type' => 'product'
    ],
    'cloud' => [],
    'contactsCompany' => [
        'requirements' => 'region',
        'type' => 'contacts'
    ],
    'crm' => [
        'requirements' => 'contactsCompany',
        'type' => 'contacts'
    ],
    'calendar' => [
        'type' => 'office'
    ],
    'marketing' => [
        'requirements' => 'region,crm',
        'type' => 'marketing'
    ],
    'messageCenter' => [],
    'uploader' => [],
    'storage' => [
        'requirements' => 'product,bpm',
        'type' => 'storage'
    ],
    'bpm' => [],
    'productAttribute' => [
        'requirements' => 'product',
        'type' => 'product'
    ],
    'notification' => [
        'requirements' => 'messageCenter'
    ],
    'sale' => [
        'requirements' => "product,bpm,crm",
        'type' => 'marketing'
    ],
    'region' => [],
    'analytics' => [
        'type' => 'analytics'
    ],
    'purchase' => [
        'requirements' => 'product,bpm,supplier',
        'type' => 'purchase'
    ],
    'supplier' => [
        'requirements' => 'contactsCompany',
        'type' => 'contacts'
    ],
    'smtp' => [],
    'printer' => [],
    'currency' => [],
    'finance' => [
        'type' => 'finance',
        'requirements' => 'bpm'
    ]
];

/*
 * 发送终止信号
 * */
function send_exit_single($msg = '') {
    $help_info_tip = "\n\nYou can get help here: http://forum.ng-erp.com\n";
    echo $msg;
    echo $help_info_tip;
    echo "\nQuit\n";
};

function display_loading($msg='loading', $times=20) {
    echo $msg;
    for($i=0;$i<$times;$i++) {
        sleep(1);
        echo '.';
    }

    echo "\n";
};

/*
 * 数据库操作失败回滚
 * */
function rollback($pdo) {
    $rollback_table = [
        'company', 'department' ,'user'
    ];
    foreach($rollback_table as $table) {
        $pdo->exec('DELETE FROM '. $table);
    }
}

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

    return $pdo;
}