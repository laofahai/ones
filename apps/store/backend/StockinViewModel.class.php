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
        "Stockin" => array("*"),
    );
    
    protected $status_lang = array(
        "not_submited", "submited_wait_for_process", "complete"
    );
    protected $status_class = array(
        "inverse", "info", "success"
    );
    
    
    public function select($options = array()) {
        $data = parent::select($options);
        if(!$data) {
            return $data;
        }
        
        foreach($data as $k=>$v) {
            if($v["stock_manager"]) {
                $data[$k]["stock_manager"] = toTruename($v["stock_manager"]);
            }
            $data[$k]["sponsor"] = toTruename($v["user_id"]);
            $ids[] = $v["id"];
        }
        
        if($this->workflowAlias) {
            import("@.Workflow.Workflow");
            $workflow = new Workflow($this->workflowAlias);
            $processData = $workflow->getListProcess($ids);
            foreach($data as $k=> $v) {
                $data[$k]["processes"] = $processData[$v[$this->workflowMainRowField]];
            }
        }
        
        return $data;
    }
    
}

?>
