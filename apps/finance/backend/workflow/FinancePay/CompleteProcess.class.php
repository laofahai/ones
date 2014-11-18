<?php

/**
 * @filename CompleteProcess.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-12-8  9:29:25
 * @Description
 * 
 */
class FinancePayCompleteProcess extends WorkflowAbstract {

    public function run() {}


    public function checkAllPayed() {
        $plan = D("FinancePayPlan")->find($this->mainrowId);

        if($plan["payed"] < $plan["amount"]) {
            return false;
        }
    }
    
}

?>
