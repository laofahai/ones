<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of ProduceBomsAction
 *
 * @author nemo
 */
class ProduceBomsAction extends CommonAction {
    
    protected $workflowAlias = "producePlan";

    protected $lockedStatus = 1;

    /*
     * read方法下 get.plan_id = get.id
     * **/
    public function read() {

        if($_GET["checkIsMaked"]) {
            return $this->checkIsMaked();
        }

        $model = D("ProduceBomsView");
        $rows = $model->where("ProduceBoms.plan_id=".$_GET["id"])->select();
        $modelIds = array();
        foreach($rows as $k=>$v) {
            $tmp = explode(DBC("goods.unique.separator"), $v["factory_code_all"]);
            $factory_code = array_shift($tmp);
            $modelIds = array_merge($modelIds, $tmp);
            $rows[$k]["modelIds"] = $tmp;
        }

        $params = array(
            $rows, $modelIds
        );
        tag("assign_dataModel_data", $params);

        $data = array(
            "rows" => $params[0]
        );
        $this->response($data);
    }

    public function update() {
        print_r($_POST);
    }

    private function checkIsMaked() {
        $plan_id = abs(intval($_GET["id"]));
        $model = D("ProduceBoms");
        if($model->where("plan_id=".$plan_id)->select()) {
            $this->response(array(
                "maked" => true
            ));
        }
    }
    

}
