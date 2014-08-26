<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of OrderComplete
 *
 * @author 志鹏
 */
class OrdersComplete extends WorkflowAbstract {
    
    public function run() {
        D("Orders")->where("id=".$this->mainrowId)->save(array(
            "status" => "2"
        ));
    }
    
}

?>
