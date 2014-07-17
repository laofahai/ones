<?php

/**
 * @filename SaveReturnsPaper.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-11-30  13:53:35
 * @Description
 * 
 */
class ReturnsSaveReturnsPaper extends WorkflowAbstract {
    /**
     * 保存退货单，生成入库单
     */
    public function run() {
        $returns = D("Returns");
        $returns->where("id=".$this->mainrowId)->save(array("status" => 1));
    }
    
}

?>
