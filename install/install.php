<?php

error_reporting(E_ALL^E_NOTICE);
define('ENTRY_PATH', dirname(dirname(__FILE__))."/server");
define('INSTALL_PATH', dirname(__FILE__));

require ENTRY_PATH."/vendor/autoload.php";
require INSTALL_PATH."/migration.php";
require INSTALL_PATH.'/common.php';
require ENTRY_PATH.'/Application/Common/Common/function.php';
require ENTRY_PATH.'/Application/Account/Common/function.php';

if((php_sapi_name() !== 'cli')) {
    echo '<pre>';
    send_exit_single("\ncli-mode only, follow: http://ones.mydoc.io/?t=17436\n");
    exit;
}

echo file_get_contents(INSTALL_PATH.'/Guide.md');
echo "\n";

display_loading('checking environment', 5);
// 检测基本环境
if(!check_env()) {
    return;
}

// 数据库连接配置
$db_config = [
    'adapter' => 'mysql',
    'host'    => '127.0.0.1',
    'port'    => '3306',
    'user'    => '',
    'pass'    => '',
    'name'    => 'ones_v1'
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
$pdo = check_db_connection($db_config, $db_config['adapter']);
if(!$pdo) {
    return;
}

// 写phinx配置
$phinx_config = file_get_contents(INSTALL_PATH.'/phinx.yml.sample');
foreach($db_config as $k=>$v) {
    $phinx_config = str_replace("%({$k})s", $v, $phinx_config);
}
file_put_contents(ENTRY_PATH."/phinx.yml", $phinx_config);

// 同步数据表结构 及权限节点
display_loading("migrating database schema, please wait for a moment");
ob_start();
$migrate = new Install(0);
$migrate->up();
ob_end_clean();

echo "\nData schema migrated success, fill out your company and super-user info\n\n";

// 公司及管理员信息
echo "Your company name: ";
$company_name = fgets(STDIN);
$sign_id = 10000;

$user_info = [
    'realname' => 'Administrator',
    'email' => '',
    'login' => 'admin',
    'password' => ''
];

/*
 * 1、 写公司信息
 * 2、 写公司部门信息
 * 3、 写超级管理信息
 * 4、 更新超级管理权限
 * 5、 更新公司超级管理
 * 6、 写应用表
 * */
foreach($user_info as $k=>$v) {
    $need_key = $k;
    if($v) {
        $need_key .= " (default is {$v})";
    }
    printf('Your %s:', $need_key);

    $input_value = trim(fgets(STDIN));
    $check_func = sprintf('check_user_input_for_'.$k);
    if(function_exists($check_func)) {
        $check_result = $check_func($input_value);
        if(true !== $check_result) {
            send_exit_single($check_result);
            return;
        } else {
            $user_info[$k] = $input_value ? $input_value : $v;
        }
    } else {
        $user_info[$k] = $input_value ? $input_value : $v;
    }
}

foreach($user_info as $k=>$v) {
    if(!$v) {
        rollback($pdo);
        return send_exit_single('Your '.$k.' is required');
    }
}

$sql = 'INSERT INTO company(name, sign_id, is_active)VALUE(:company_name, :sign_id, 1)';
$prepared = $pdo->prepare($sql);
$prepared->bindParam(':company_name', $company_name);
$prepared->bindParam(':sign_id', $sign_id);
if(!$prepared->execute()) {
    rollback($pdo);
    return send_exit_single('write company info failed (base info).');
}
// 公司ID
$company_id = $pdo->lastInsertId();


// config中公司名称
$sql = "INSERT INTO company_profile(company_id)VALUE(:company_id)";
$prepared = $pdo->prepare($sql);
$prepared->bindParam(':company_id', $company_id);
if(!$prepared->execute()) {
    rollback($pdo);
    return send_exit_single('write company info failed (config).');
}

// 公司部门
$sql = "INSERT INTO department(name, lft, rgt, company_id)VALUE(:name, 1, 2, :company_id)";
$prepared = $pdo->prepare($sql);
$prepared->bindParam(':name', $company_name);
$prepared->bindParam(':company_id', $company_id);
if(!$prepared->execute()) {
    rollback($pdo);
    return send_exit_single('write company department info failed.');
}
$department_id = $pdo->lastInsertId();

// 超级管理用户
list($password, $hash) = generate_password($user_info['password']);
$sql = "INSERT INTO user_info(login, password, realname, email, rand_hash, department_id, company_id)
        VALUE(:login, :password, :realname, :email, :rand_hash, :department_id, :company_id)";
$prepared = $pdo->prepare($sql);
$prepared->bindParam(':login', $user_info['login']);
$prepared->bindParam(':password', $password);
$prepared->bindParam(':realname', $user_info['realname']);
$prepared->bindParam(':email', $user_info['email']);
$prepared->bindParam(':rand_hash', $hash);
$prepared->bindParam(':department_id', $department_id);
$prepared->bindParam(':company_id', $company_id);
if(!$prepared->execute()) {
    rollback($pdo);
    return send_exit_single('write user info failed.');
}
$user_id = $pdo->lastInsertId();

// 更新公司超级管理
$sql = "UPDATE company SET superuser=:user_id WHERE id=:company_id";
$prepared = $pdo->prepare($sql);
$prepared->bindParam(':user_id', $user_id);
$prepared->bindParam(':company_id', $company_id);
if(!$prepared->execute()) {
    rollback($pdo);
    return send_exit_single('update company super-user failed.');
}

// 写超级管理角色
$sql = "INSERT INTO auth_role(name, company_id)VALUE('Super User', :company_id)";
$prepared = $pdo->prepare($sql);
$prepared->bindParam(":company_id", $company_id);
if(!$prepared->execute()) {
    rollback($pdo);
    return send_exit_single('write user role failed.');
}
$auth_role_id = $pdo->lastInsertId();

$sql = "INSERT INTO auth_user_role(user_info_id, company_id, auth_role_id)VALUE(:user_id, :company_id, :auth_role_id)";
$prepared = $pdo->prepare($sql);
$prepared->bindParam(":user_id", $user_id);
$prepared->bindParam(":company_id", $company_id);
$prepared->bindParam(":auth_role_id", $auth_role_id);
if(!$prepared->execute()) {
    rollback($pdo);
    return send_exit_single('write user role failed.');
}

// 写超级管理基本授权
$sql = "SELECT * FROM auth_node WHERE node = 'account.authorize.put'";
$sth = $pdo->query($sql);
$sth->execute();
$auth_node = $sth->fetch(PDO::FETCH_ASSOC);
if(!$auth_node) {
    rollback($pdo);
    return send_exit_single('user role authorize failed (fetch auth node).');
}

$sql = "INSERT INTO authorize(flag, company_id, auth_role_id, auth_node_id)VALUE(1, :company_id, :auth_role_id, :auth_node_id)";
$prepared = $pdo->prepare($sql);
$prepared->bindParam(':company_id', $company_id);
$prepared->bindParam(':auth_role_id', $auth_role_id);
$prepared->bindParam(':auth_node_id', $auth_node['id']);
if(!$prepared->execute()) {
    rollback($pdo);
    return send_exit_single('user role authorize failed (authorize).');
}

// 商品分类ROOT节点
$sql = "INSERT INTO product_category(name, lft, rgt, company_id)VALUES('Product Category', 1, 2, :company_id)";
$prepared = $pdo->prepare($sql);
$prepared->bindParam(':company_id', $company_id);
if(!$prepared->execute()) {
    rollback($pdo);
    return send_exit_single('create product root category failed.');
}

// 创建session表
$pdo->exec("CREATE TABLE IF NOT EXISTS `session` (
  `session_id` varchar(255) NOT NULL,
  `session_expire` int(11) NOT NULL,
  `session_data` blob,
  UNIQUE KEY `session_id` (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;");

// 写应用表及应用Migration
$sql = "INSERT INTO app(alias, requirements)VALUES(:alias, :requirements)";
$prepared = $pdo->prepare($sql);

$path = ENTRY_PATH."/Application/";
$dh = opendir($path);
$migration_version = 10000;
while(($app_name = readdir($dh)) !== false) {
    $config_file = $path.$app_name.'/config.yml';
    if("." !== substr($app_name, 0, 1)) {
        if(is_file($config_file)) {
            $app_config = \Symfony\Component\Yaml\Yaml::parse(file_get_contents($config_file));
            
            $alias = $app_config["alias"];

            $requirements = implode(",", (array)$app_config["requirements"]);

            $prepared->bindParam(':alias', $alias);
            $prepared->bindParam(':requirements', $requirements);
            $prepared->execute();
        }

        // 应用migration
        $migration_dir = $path.$app_name."/Migration/";
        if(is_dir($migration_dir)) {
            $fh = opendir($migration_dir);
            while(($migration_file = readdir($fh)) !== false) {

                if(substr($migration_file, -4) === '.php') {
                    require $migration_dir.$migration_file;
                    $tmp = explode(".", $migration_file);
                    $class_name = array_shift($tmp);
                    $class_name = sprintf(
                        '\%s\Migration\%s',
                        $app_name,
                        $class_name
                    );
                    $migrate = new $class_name($migration_version);
                    $migrate->up();
                    $migration_version++;
                }
            }
            closedir($fh);
        }
        
    }
}
closedir($dh);

display_loading('initialize company and super-user', 5);

file_put_contents(ENTRY_PATH.'/Data/install.lock', time());

echo "\n\n";
echo file_get_contents(INSTALL_PATH.'/Complete.md');

echo "\nYour login info: \n";
echo "Company sign id: 10000\n";
echo "Login name: ". $user_info['login']."\n";
echo "Password: ". $user_info['password']."\n\n";
exit;