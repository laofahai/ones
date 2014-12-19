<?php

/**
 * @filename WorkflowInterface.class.php 
 * @encoding UTF-8 
 * @author 闫志鹏 <a href="mailto:dk_nemo@163.com">dk_nemo@163.com</a>
 *
 *
 * @datetime 2013-11-15  10:08:13
 * @Description
 * 
 */
Interface WorkflowInterface {
    
    /**
     * 流程节点开始时执行
     * 子类需重写此方法
     */
    public function init();
    
    /**
     * 流程运行时
     * 子类需重写此方法，逻辑处理结束必须执行self::save();
     */
    public function run();
    
    /**
     * 流程结束后，保存至workflow_process表
     */
    public function save();
    
}

?>
