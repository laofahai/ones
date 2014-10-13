<?php

/**
 * @filename SavePurchase.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-12-7  10:50:21
 * @Description
 * 
 */
class PurchaseSavePurchase extends WorkflowAbstract {
    
    public function run() {
        D("Purchase")->where("id=".$this->mainrowId)->save(array("status" => 1));

        //财务
        if(isModuleEnabled("Finance")) {

        }

    }
    
}

?>
