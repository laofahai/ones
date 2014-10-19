<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 14-10-12
 * Time: 9:46
 */

class StockinCompleteProcess extends WorkflowAbstract {

    public function run() {
        D("Stockin")->where("id=".$this->mainrowId)->save(array(
            "status" => 2
        ));
    }

}