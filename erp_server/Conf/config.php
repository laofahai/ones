<?php
return array(
    
    /* 数据库配置 */
    'DB_TYPE'            =>    'mysql',        // 数据库类型
    'DB_HOST'            =>    '127.0.0.1',    // 数据库服务器地址
    'DB_NAME'            =>    'x',            // 数据库名
    'DB_USER'            =>    'root',        // 数据库用户名
    'DB_PWD'             =>    'root',    // 数据库密码
    'DB_PORT'            =>    3306,            // 数据库端口
    'DB_PREFIX'          =>    'x_',            // 数据库表前缀
    'DB_CHARSET'         =>    'utf8',            // 数据库编码
    'SECURE_CODE'        =>    'the_x',    // 数据加密密钥
    
    'APP_GROUP_LIST' => 'HOME,CRM,SCM,JXC,OA,Finance,Statistics,Produce,OA,Accounting', //项目分组设定
    'DEFAULT_GROUP'  => 'HOME', //默认分组
    'URL_MODEL' => 1,
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
        'AUTH_DONT_NEED' => array(
            "passport.userLogin"
        )
    ),
    
    
);