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
        array("status", 0),
        array("user_id", "getCurrentUid", 1, "function")
    );
    
    protected $workflowAlias = "stockin";
    
    /**
     * 创建新单据
     */
    public function newBill($billData, $billItems) {
        if(!$billItems) {
            return;
        }
        
        $this->startTrans();
        $billId = $this->add($billData);
        
        $itemsModel = D("StockinDetail");
        foreach($billItems as $billItem) {
            $billItem["stockin_id"] = $billId;
            $id = $itemsModel->add($billItem);
            
            if(!$id) {
                $this->rollback();
                break;
            }
        }
        
        $this->commit();
        
        //单据进入初始工作流程
        import("@.Workflow.Workflow");
        $workflow = new Workflow($this->workflowAlias);
        $node = $workflow->doNext($billId, "", true);
        
        return $billId;
        
    }
    
    
}

?>
