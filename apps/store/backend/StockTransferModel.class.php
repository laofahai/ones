<?php

/**
 * @filename StockTransferModel.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-12-15  9:11:28
 * @Description
 * 
 */
class StockTransferModel extends CommonModel {
    
    protected $workflowAlias = "stocktransfer";
    
    protected $_auto = array(
        array("dateline", CTS),
        array("status", 0),
        array("total_num", 0),
        array("user_id", "getCurrentUid", 1, "function"),
    );
    
}

?>
