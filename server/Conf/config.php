<?php

$baseConfig = array(

    /*
     * API KEY
     * **/
    'SERVICE_API_KEY' => md5("ones"),
    
    /* 数据库配置 */
    'DB_TYPE'            =>    'mysql',        // 数据库类型
    'DB_HOST'            =>    '127.0.0.1',    // 数据库服务器地址
    'DB_NAME'            =>    'ones',            // 数据库名
    'DB_USER'            =>    'root',        // 数据库用户名
    'DB_PWD'             =>    'root',    // 数据库密码
    'DB_PORT'            =>    3306,            // 数据库端口
    'DB_PREFIX'          =>    'x_',            // 数据库表前缀
    'DB_CHARSET'         =>    'utf8',            // 数据库编码
    'SECURE_CODE'        =>    'the_x',    // 数据加密密钥
    'MYSQL_BIN'          => '', //执行mysql bin目录，或者软链接至/usr/bin目录。目前需用到mysql, mysqldump命令

    'DEFAULT_FILTER'     => "",
    
    'LOG_RECORD' => true, // 开启日志记录
    'LOG_LEVEL'  =>'EMERG,ALERT,CRIT,ERR,WARN,DEBUG,SQL', // 只记录EMERG ALERT CRIT ERR 错误
    
    'APP_GROUP_LIST' => 'HOME,Passport,JXC', //项目分组设定
    'DEFAULT_GROUP'  => 'HOME', //默认分组
    'URL_MODEL' => 0,
    'URL_ROUTE_RULES' => require "route.php",

    /**
     * AUTH 权限控制
     */
    'AUTH_CONFIG'=>array(
        'AUTH_ON' => true, //认证开关
        'AUTH_TYPE' => 1, // 认证方式，1为时时认证；2为登录认证。
        'AUTH_GROUP' => 'x_auth_group', //用户组数据表名
        'AUTH_GROUP_ACCESS' => 'x_auth_group_access', //用户组明细表
        'AUTH_RULE' => 'x_auth_rule', //权限规则表
        'AUTH_USER' => 'x_user',//用户信息表
        /**
         * 无需登录模块
         */
        'AUTH_DONT_NEED_LOGIN' => array(
            "Passport.Login.add",
            "Passport.Login.read",
            "HOME.MyDesktop.read",
            "HOME.FrontendRuntime.read"
        ),
        /**
         * 无需认证模块
         */
        'AUTH_DONT_NEED' => array(
            "HOME.Types.read",
            "HOME.Index.read",
            "Workflow.WorkflowNode.read",
            "Workflow.WorkflowProcess.read",
            "Dashboard.UserDesktop.read",
            "Dashboard.MyDesktop.add",
        )
    ),

);

require ENTRY_PATH."/Lib/ORG/spyc.php";
$yamlConfig = Spyc::YAMLLoad(ROOT_PATH."/common/config.yaml.php");

return array_merge_recursive($baseConfig, $yamlConfig["backend"]);