<?php

/**
 * @filename AuthGroupRuleViewModel.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
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
