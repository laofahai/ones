<?php

/**
 * @filename StockinModel.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-11-13  14:18:25
 * @Description
 * 
 */
class StockinModel extends CommonModel {
    
    protected $_auto = array(
        array("dateline","time",1,"function"),
        array("status", 0),
        array("confirm_user_id", "getCurrentUid", 1, "function"),
        array("user_id", "getCurrentUid", 1, "function")
    );
    
    protected $workflowAlias = "stockin";
    
    
}

?>
