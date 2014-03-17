<?php

/**
 * @filename ReturnsModel.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-11-30  11:13:09
 * @Description
 * 
 */
class ReturnsModel extends CommonModel {
    protected $workflowAlias = "returns";
    
    protected $_auto = array(
        array("dateline", CTS),
        array("status", 0),
        array("total_num", 0),
        array("bill_code", "makeBillCode", 1, "function"),
        array("saler_id", "getCurrentUid", 1, "function"),
    );
    
}

?>
