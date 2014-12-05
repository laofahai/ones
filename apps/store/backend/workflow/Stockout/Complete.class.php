<?php

/**
 * @filename CompleteStockout.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-12-1  14:07:44
 * @Description
 * 
 */
class StockoutComplete extends WorkflowAbstract {
    
    public function run() {

        $model = D("Stockout");
        
        $theStockout = $model->find($this->mainrowId);
        
        $model->where("id=".$this->mainrowId)->save(array("status"=>2));

        if($this->context["sourceModel"]) {
            $sourceNode = $this->getNodeByAlias(lcfirst($this->context["sourceModel"]), "Complete");
            $workflow = new Workflow($this->context["sourceWorkflow"], $this->context);
            $workflow->doNext($theStockout["source_id"], $sourceNode["id"], true, 3);
        }
    }

    public function isAllComplete() {
        $theStockout = D("Stockout")->find($this->mainrowId);
        return $theStockout["outed_num"] >= $theStockout["total_num"];
    }
    
}

?>
