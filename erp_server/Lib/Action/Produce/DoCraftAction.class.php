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
     */
    public function update() {
        $ids = explode(",", $_GET["id"]);
        
        $viewModel = D("ProduceProcessView");
        $data = $viewModel->assignProcessData($ids, true);
        
        $doingData = array();
        foreach($data as $row) {
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
        
        $proessModel = D("ProduceProcess");
        if($proessModel->doProcess($doingData)) {
            $this->success();
        } else {
            $this->error("server error");
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
    
    
}
