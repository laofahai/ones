<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of ProducePlanDetailViewModel
 *
 * @author nemo
 */
class ProducePlanDetailViewModel extends CommonViewModel {
    
    protected $viewFields = array(
        "ProducePlanDetail" => array("*", "_type"=>"left"),
        "ProducePlan" => array("end_time"=>"plan_end_time", "_on"=>"ProducePlanDetail.plan_id=ProducePlan.id","_type"=>"left"),
        "Goods" => array("name"=>"goods_name", "goods_category_id", "_on"=>"Goods.id=ProducePlanDetail.goods_id", "_type"=>"left")
    );

    public $searchFields = array(
        "ProducePlan.bill_id", "Goods.name"
    );
    
    public function select($options=array()) {
        $data = parent::select($options);
        if(!$data) {
            return $data;
        }

        $params = array(
            $data, false
        );
        tag("assign_dataModel_data", $params);

        $data = $params[0];
        $processModel = D("ProduceProcessView");
        $data = $processModel->assignProcessData($data);

        return $data;
    }
}
