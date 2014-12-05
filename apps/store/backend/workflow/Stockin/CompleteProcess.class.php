<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 14-10-12
 * Time: 9:46
 */

class StockinCompleteProcess extends WorkflowAbstract {

    public function run() {

        $stockin = D("Stockin");

        $stockin->where("id=".$this->mainrowId)->save(array(
            "status" => 2
        ));

        $theStockin = $stockin->find($this->mainrowId);
        if($theStockin["source_model"]) {
            //若外部生成，走外部下一流程
            $workflow = new Workflow(lcfirst($theStockin["source_model"]), $this->action);
            $workflow->doNext($theStockin["source_id"], "", true, 3);
        }

    }

    public function isAllComplete() {
        $theStockin = D("Stockin")->find($this->mainrowId);
        return $theStockin["ined_num"] >= $theStockin["total_num"];
    }

}