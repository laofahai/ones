<?php

/**
 * @filename CompleteProcess.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-11-30  14:32:37
 * @Description
 * 
 */
class PurchaseCompleteProcess extends WorkflowAbstract {
    
    public function run() {
        $this->updateStatus("Purchase", $this->mainrowId, 2);
    }
    
}

?>
