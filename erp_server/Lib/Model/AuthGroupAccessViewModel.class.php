<?php

/**
 * @filename AuthGroupAccessViewModel.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-11-18  15:09:33
 * @Description
 * 
 */
class AuthGroupAccessViewModel extends CommonViewModel {
    
    protected $viewFields = array(
        "AuthGroupAccess" => array("uid", "group_id"),
        "AuthGroup" => array("id","title","status","rules", "_on"=>"AuthGroupAccess.group_id=AuthGroup.id"),
        "User" => array("truename", "_on"=>"User.id=AuthGroupAccess.uid")
    );
    
}

?>
