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
    "settings" => array(
        "childs" => array(
            "app_center" => "HOME/list/apps",
            "field_set" => "HOME/list/config",
            "base_data_set" => array(
                "types_manage"  => "HOME/list/types",
            ),
            "system_operation" => array(
                "clear_cache" => "HOME/list/clearCache",
            )
        ),
        "icon" => "cog"
    )
);
