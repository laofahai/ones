<?php

/**
 * @filename SaveStockin.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-11-17  9:13:50
 * @Description
 * 
 */
class StockinSaveStockin extends WorkflowAbstract {
    
    public function run() {
        $this->updateStatus("Stockin", $this->mainrowId, 1);
    }
    
}
