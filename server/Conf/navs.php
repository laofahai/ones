<?php

/**
 * @filename navs.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-12-6 16:14:57
 * @description
 * 
 */

return array(
    "dashboard" => array(
        "childs" => array(),
        "icon" => "home",
        "action" => "HOME/Index/dashboard"
    ),
    "settings" => array(
        "childs" => array(
            "field_set" => "HOME/list/config",
            "base_data_set" => array(
                "types_manage"  => "HOME/list/types",
                "user_desktop"  => "HOME/list/userDesktop"
            ),
            "system_operation" => array(
                "clear_cache" => "HOME/Settings/clearCache",
            )
            
        ),
        "icon" => "cog"
    ),
    "stock" => array(
        "childs" => array(),
        "icon" => "th-large",
    ),
);
