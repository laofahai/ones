<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of RejectStockout
 *
 * @author 志鹏
 */
class StockoutRejectStockout extends WorkflowAbstract {
    
    public function run() {
        if($_POST["memo"]) {
            $this->memo = trim($_POST["memo"]);
            
            $stockout = D("Stockout{$this->context["sourceModel"]}Relation");
            $thePaper = $stockout->find($this->mainrowId);
            
            $source = D($this->context["sourceModel"]);
            $source->where("id=".$thePaper["source_id"])->save(array("status"=>0));
            
            $stockout->relation(true)->where("id=".$this->mainrowId)->delete();
            
            //订单流程回滚
            $node = $this->getNodeByAlias($this->context["sourceModel"], $this->currentNode["execute_file"]);
            if(!$node) {
                return;
            }
            $reject = new Workflow($this->context["sourceWorkflow"], array("memo"=>$this->memo));
            $rs = $reject->doNext($this->context["sourceId"], $node["id"], true, true);
            
            $this->updateMemo($this->context["sourceWorkflow"], $this->context["sourceId"], $node["id"], $this->memo);
//            echo $this->context["sourceId"];
//            print_r($node);
//            var_dump($rs);exit;
            return;
        }
        
        import("@.Form.Form");
        $form = new Form("WorkflowMemo");
        $this->view->assign("FormHTML", $form->makeForm(""));
        $this->view->assign("lang_title", "leave_reject_reason");
        $this->view->display("../Common/Workflow/leaveMemo");
        
        return "wait";
    }
    
}

?>
