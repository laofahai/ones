<?php

/**
 * @filename WorkflowInterface.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
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
