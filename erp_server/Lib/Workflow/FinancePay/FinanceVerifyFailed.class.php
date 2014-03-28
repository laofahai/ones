<?php

/**
 * @filename FinanceVerifyFailed.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-12-8  9:28:55
 * @Description
 * 
 */
class FinancePayFinanceVerifyFailed extends WorkflowAbstract {
    
    public function run() {
        if(!IS_POST) {
            return $this->displayLeaveMemo();
        }
        
        $this->memo = trim($_POST["memo"]);
//        $this->updateMemo("financePay", $this->mainrowId, $this->currentNode["id"], trim($_POST["memo"]));
    }
    
}

?>
