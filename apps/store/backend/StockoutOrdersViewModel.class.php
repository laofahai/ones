<?php

/**
 * @filename StockoutOrdersViewModel.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-11-18  12:10:05
 * @Description
 * 
 */
class StockoutOrdersViewModel extends CommonViewModel {
    
    protected $viewFields = array(
        "Stockout" => array("id","bill_id","source_id","dateline", "outtime", "stock_manager","status"),
        "Orders" => array("total_num","total_amount","total_amount_real", "_on"=>"Orders.id=Stockout.source_id"),
//        "Stock" => array("name"=>"stock_name", "_on"=>"Stock.id=Orders.stock_id"),
//        "User" => array("truename"=>"stock_manager_name", "_on"=>"User.id=Stockout.stock_manager")
    );
    
    protected $status_lang = array(
        "wait_process", "stockouted"
    );
    
    protected $status_class = array(
        "info", "success"
    );
    
    protected $workflowAlias = "order";
    
    protected $workflowMainRowField = "id";
    
}

?>
