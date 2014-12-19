<?php

/**
 * @filename AuthGroupAccessViewModel.class.php 
 * @encoding UTF-8 
 * @author 闫志鹏 <a href="mailto:dk_nemo@163.com">dk_nemo@163.com</a>
 *
 *
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
