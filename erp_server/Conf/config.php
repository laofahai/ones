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
    
    
);
?>