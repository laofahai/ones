<?php

$BASEConfig = array(

    /*
     * API KEY
     * **/
    'SERVICE_API_KEY' => '[service_api_key]',

    /* 数据库配置 */
    'DB_TYPE'            =>    'mysql',        // 数据库类型
    'DB_HOST'            =>    '127.0.0.1',    // 数据库服务器地址
    'DB_NAME'            =>    'erp_zhongpu',            // 数据库名
    'DB_USER'            =>    'root',        // 数据库用户名
    'DB_PWD'             =>    'root',    // 数据库密码
    'DB_PORT'            =>    '3306',            // 数据库端口
    'DB_PREFIX'          =>    'x_',            // 数据库表前缀
    'DB_CHARSET'         =>    'utf8',            // 数据库编码
    'SECURE_CODE'        =>    'the_x',    // 数据加密密钥
    'MYSQL_BIN'          => '', //执行mysql bin目录，或者软链接至/usr/bin目录。目前需用到mysql, mysqldump命令

    'DEFAULT_FILTER'     => "",

    'LOG_PATH' => ENTRY_PATH."/Data/logs/",
    'LOG_RECORD' => true, // 开启日志记录
    'LOG_LEVEL'  =>'EMERG,ALERT,CRIT,ERR,WARN,DEBUG,SQL', // 只记录EMERG ALERT CRIT ERR 错误
    
    'APP_GROUP_LIST' => 'HOME,Passport,API', //项目分组设定
    'DEFAULT_GROUP'  => 'HOME', //默认分组
    'URL_MODEL' => 0,
    'URL_ROUTE_RULES' => require "route.php",

    'SESSION_TYPE'=>   'DB',
    'SESSION_TABLE'=>  'x_session',
    'SESSION_EXPIRE' => 3600,

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
            "passport.login.add",
            "passport.login.read",
            "home.frontendruntime.read",
            "home.install.read",
            "home.index.read"
        ),
        /**
         * 无需认证模块
         */
        'AUTH_DONT_NEED' => array(
            "home.types.read",
            "home.index.dashboard",
            "home.mydesktop.read",
            "workflow.workflownode.read",
            "workflow.workflowprocess.read",
            "dashboard.userdesktop.read",
            "dashboard.mydesktop.add",
            "dashboard.mydesktop.read",
            "api.uploader.add",
        )
    ),

    //超级用户ID
    'suid' => array(
        '1'
    )
);



require ENTRY_PATH."/Lib/ORG/spyc.php";
$YAMLConfig = Spyc::YAMLLoad(ROOT_PATH."/common/config.yaml.php");
$BASEConfig = array_merge_recursive($BASEConfig, $YAMLConfig["backend"]);

return $BASEConfig;