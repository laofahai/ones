<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of ProduceBomsViewModel
 *
 * @author nemo
 */
class ProduceBomsViewModel extends CommonViewModel {
    
    protected $viewFields = array(
        "ProduceBoms" => array("*", "_type"=>"left"),
//        "ProducePlan" => array("_on"=>"ProducePlan.id=ProduceBoms.plan_id", "_type"=>"left"),
        "ProducePlanDetail" => array("goods_id"=>"detail_goods_id","_on"=>"ProducePlanDetail.id=ProduceBoms.plan_detail_id", "_type"=>"left")
    );
    
    public function select($options = array()) {
        $data = parent::select($options);
        if(!$data) {
            return $data;
        }
        $goodsIds = array();
        foreach($data as $k=>$v) {
            $goodsIds[$v["goods_id"]] = $v["goods_id"];
            $goodsIds[$v["detail_goods_id"]] = $v["detail_goods_id"];
        }
        
        $model = D("Goods");
        $tmp = $model->where(array(
            "id" => array("IN", implode(",", $goodsIds))
        ))->select();
        
        foreach($tmp as $g) {
            $goods[$g["id"]] = $g;
        }
        
        foreach($data as $k=>$v) {
            $data[$k]["goods_id_label"] = $goods[$v["goods_id"]]["name"];
            list($factory_code,) = explode(DBC("goods.unique.separator"), $v["factory_code_all"]);
            $data[$k]["goods_id"] = sprintf("%s_%s_%s", 
                    $factory_code, 
                    $v["goods_id"],
                    $goods[$v["goods_id"]]["goods_category_id"]
                );
//            $data[$k]["goods"] = $goods[$v["detail_goods_id"]];
        }
        
        return $data;
//        print_r($codes);
        
        print_r($data);
    }
    
}
