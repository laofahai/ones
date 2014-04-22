<?php

/**
 * @filename StockoutViewModel.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-12-1  11:27:41
 * @Description
 * 
 */
class StockoutViewModel extends CommonViewModel {
    
    protected $workflowAlias = "stockout";
    
    protected $viewFields = array(
        "Stockout" => array("id","bill_id","source_id","source_model","dateline","outtime","total_num","stock_manager"=>"stock_manager_id","status"),
        "User" => array("truename"=>"stock_manager", "_on"=>"User.id=Stockout.stock_manager", "_type"=>"left")
    );
    
}

?>