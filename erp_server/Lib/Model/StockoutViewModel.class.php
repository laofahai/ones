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
        "Stockout" => array("id", "subject","source_id","source_model","dateline","outtime","stock_id","total_num","stock_manager","status")
    );
    
}

?>
