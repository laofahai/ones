<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of OrdersModel
 *
 * @author 志鹏
 */
class OrdersModel extends CommonModel {
    
    protected $workflowAlias = "order";
    
    protected $_auto = array(
        array("dateline", CTS),
        array("status", 0),
        array("total_num", 0),
        array("total_price", 0),
        array("total_price_real", 0),
        array("bill_code", "makeBillCode", 1, "function"),
        array("saler_id", "getCurrentUid", 1, "function"),
    );
    
}

?>
