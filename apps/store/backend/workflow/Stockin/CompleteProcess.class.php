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

    public function isAllComplete() {
        $theStockin = D("Stockin")->find($this->mainrowId);
        return $theStockin["ined_num"] >= $theStockin["total_num"];
    }

}