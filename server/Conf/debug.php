<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 14-7-13
 * Time: 13:57
 */

return  array(
    'LOG_PATH' => ENTRY_PATH."/Data/logs/",
    'LOG_RECORD'			=>	true,  // 进行日志记录
    'LOG_EXCEPTION_RECORD'  => 	true,    // 是否记录异常信息日志
    'LOG_LEVEL'  =>'EMERG,ALERT,CRIT,ERR,WARN,DEBUG,SQL', // 只记录EMERG ALERT CRIT ERR 错误
    'DB_FIELDS_CACHE'		=> 	false, // 字段缓存信息
    'DB_SQL_LOG'			=>	true, // 记录SQL信息
    'APP_FILE_CASE'  		=>  true, // 是否检查文件的大小写 对Windows平台有效
    'TMPL_CACHE_ON'    		=> 	false,        // 是否开启模板编译缓存,设为false则每次都会重新编译
    'TMPL_STRIP_SPACE'      => 	false,       // 是否去除模板文件里面的html空格与换行
    'SHOW_ERROR_MSG'        => 	true,    // 显示错误信息
);