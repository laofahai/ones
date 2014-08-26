<?php

/**
 * @filename SaveOrder.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-11-16  10:25:41
 * @Description
 *  新建订单保存
 */
class OrdersSaveOrder extends WorkflowAbstract {
    
    /**
     * 新建订单保存
     */
    public function run() {
        $order = D("Orders");
        $order->where("id=".$this->mainrowId)->save(array("status" => 1));
//        echo $order->getLastSql();exit;
    }
    
}

?>
