<?php

$BASEConfig = array(

    /*
     * API KEY
     * **/
    'SERVICE_API_KEY' => '[api_key]',
    'SERVICE_SECRET_KEY' => '[secret_key]',

    /* 数据库配置 */
    'DB_TYPE'            =>    'mysqli',        // 数据库类型
    'DB_HOST'            =>    '[db_host]',    // 数据库服务器地址
    'DB_NAME'            =>    '[db_name]',            // 数据库名
    'DB_USER'            =>    '[db_user]',        // 数据库用户名
    'DB_PWD'             =>    '[db_pwd]',    // 数据库密码
    'DB_PORT'            =>    '[db_port]',            // 数据库端口
    'DB_PREFIX'          =>    '[db_pre]',            // 数据库表前缀
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


    /**
     * AUTH 权限控制
     */
    'AUTH_CONFIG'=>array(
        'AUTH_ON' => true, //认证开关
        'AUTH_TYPE' => 1, // 认证方式，1为时时认证；2为登录认证。
        'AUTH_GROUP' => '[db_pre]auth_group', //用户组数据表名
        'AUTH_GROUP_ACCESS' => '[db_pre]auth_group_access', //用户组明细表
        'AUTH_RULE' => '[db_pre]auth_rule', //权限规则表
        'AUTH_USER' => '[db_pre]user',//用户信息表
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