<?php

/**
 * @filename StockinViewModel.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-11-13  13:55:37
 * @Description
 * 
 */
class StockinViewModel extends CommonViewModel {
    
    protected $workflowAlias = 'stockin';
    
    protected $viewFields = array(
        "Stockin" => array("id","subject","dateline","status","total_num","stock_id","user_id","stock_manager","memo"),
        "Stock" => array("name"=>"stock_name", "_on" => "Stock.id=Stockin.stock_id"),
        "User"  => array("truename"=>"sponsor", "_on" => "User.id=Stockin.user_id"),
    );
    
    protected $status_lang = array(
        "not_submited", "submited_wait_for_process", "complete"
    );
    protected $status_class = array(
        "inverse", "info", "success"
    );
    
    
}

?>
