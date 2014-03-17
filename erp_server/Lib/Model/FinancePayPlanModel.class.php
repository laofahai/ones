<?php

/**
 * @filename FinancePayPlanModel.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-12-8  8:59:31
 * @Description
 * 
 */
class FinancePayPlanModel extends CommonModel {
    
    protected $workflowAlias = "financePay";
    
    protected $_auto = array(
        array("create_dateline", CTS),
        array("account_id", 0),
        array("status", 0),
        array("source_model", ""),
        array("source_id", ""),
        array("user_id", "getCurrentUid", 1, "function"),
    );
    
}

?>
