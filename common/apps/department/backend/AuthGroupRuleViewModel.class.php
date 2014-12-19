<?php

/**
 * @filename AuthGroupRuleViewModel.class.php 
 * @encoding UTF-8 
 * @author 闫志鹏 <a href="mailto:dk_nemo@163.com">dk_nemo@163.com</a>
 *
 *
 * @datetime 2013-11-29  9:22:10
 * @Description
 * 
 */
class AuthGroupRuleViewModel extends CommonViewModel {
    
    protected $viewFields = array(
        "AuthGroupRule" => array("group_id","rule_id","flag"),
        "AuthRule" => array("name","_on"=>"AuthGroupRule.rule_id=AuthRule.id")
    );

    public $searchFields = array(
        "name", "title"
    );
    
}
