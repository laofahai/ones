<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of DoCraftAction
 *
 * @author nemo
 */
class DoCraftAction extends CommonAction {
    
    
    /**
     * 返回当前生产计划所有成品的列表，包含成品所经过工序信息
     */
    //index();
    
    protected $indexModel = "ProducePlanDetailView";
    
    protected function _filter(&$map) {
        $plan_id = abs(intval($_GET["plan_id"]));
        $map["ProducePlanDetail.plan_id"] = $plan_id;
    }
    
    /**
     * 执行产品的生产工序
     * @params $ids => ProducePlanDetail.id
     *
     * 1、工艺执行开始 -》
     * 2、结束当前工艺 -》current.status = 1, current.end_time = CTS;
     *      判断当前工艺是否最后工艺，if true: 更新detail.end_time = CTS
     * 3、执行下一工艺 -》insert next status -> produce process next.start_time = CTS, status=0
     * 4、完成所有工艺 ->
     */
    public function update() {

        $ids = explode(",", $_GET["id"]);

        //结束当前工艺
        if($_GET["act"] == "endCurrentCraft") {
            return $this->endCurrentNode();
        }
        
        $viewModel = D("ProduceProcessView");
        $data = $viewModel->assignProcessData($ids, true);

        $doingData = array();
        foreach($data as $row) {
            $planIds[] = $row["plan_id"];
            $doingData[] = array(
                "plan_detail_id" => $row["id"],
                "plan_id" => $row["plan_id"],
                "craft_id"=> $row["processes"]["next_craft_id"],
                "goods_id" => $row["goods_id"],
                "factory_code_all" => $row["factory_code_all"],
                "start_time"=> CTS,
                "end_time"=> "",
                "status"  => 0,
                "memo"    => ""
            );
        }
        
        $processModel = D("ProduceProcess");
        if($processModel->doProcess($doingData)) {


            D("ProducePlan")->where(array(
                "id" => array("IN", implode(",",$planIds)),
                "status" => array("LT", 3)
            ))->save(array(
                "status"=>3
            ));

//            $this->success();
        } else {
            $this->error("all_craft_ended");
        }
        
    }
    
    /**
     * 查看工序进程
     */
    public function read() {
        $detailId = abs(intval($_GET["id"]));
        $data = D("ProducePlanDetailView")->find($detailId);
        $model = D("ProduceProcessView");
        $rows = $model->where("plan_detail_id=".$detailId)->group("ProduceProcess.id")->select();
        $data["rows"] = $rows;

        $this->response($data);
    }

    private function endCurrentNode($ids=array()) {
        $ids = $ids ? $ids : array(abs(intval($_GET["id"])));

        $model = D("ProduceProcess")->where(array(
            "plan_detail_id" => array('IN', $ids),
            "status" => "0"
        ))->save(array(
            "end_time" => CTS,
            "status" => 1
        ));

    }
    
    
}
