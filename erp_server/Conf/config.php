<?php
return array(
    
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
    
    'SESSION_TYPE' => 'DB', 
    'SESSION_TABLE' => 'x_session', 
    'SESSION_EXPIRE' => 3600,
    
    'DEFAULT_FILTER'     => "",
    
    'LOG_RECORD' => true, // 开启日志记录
    'LOG_LEVEL'  =>'EMERG,ALERT,CRIT,ERR', // 只记录EMERG ALERT CRIT ERR 错误
    
    'APP_GROUP_LIST' => 'HOME,Passport,CRM,SCM,JXC,OA,Finance,Statistics,Produce,OA,Accounting', //项目分组设定
    'DEFAULT_GROUP'  => 'HOME', //默认分组
    'URL_MODEL' => 0,
    'URL_ROUTE_RULES' => require "route.php",
    
    /**
     * 单据编号前缀
     */
    "BILL_PREFIX" => array(
        "Stockin" => "RK"
    ),
    
    
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
        'AUTH_DONT_NEED' => array(
            "Passport.Login.insert"
        )
    ),
    
    'LANG_SWITCH_ON' => true,   // 开启语言包功能
//    'LANG_AUTO_DETECT' => true, // 自动侦测语言 开启多语言功能后有效
    'LANG_LIST'        => 'zh-cn,en-us', // 允许切换的语言列表 用逗号分隔
    'VAR_LANGUAGE'     => '0', // 默认语言切换变量
    
    
);