<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of ProduceProcessViewModel
 *
 * @author nemo
 */
class ProduceProcessViewModel extends CommonViewModel {
    
    protected $viewFields = array(
        "ProduceProcess" => array("*", "_type"=>"left"),
        "Craft" => array("name"=>"craft_name", "_on"=>"Craft.id=ProduceProcess.craft_id", "_type"=>"left"),
        "GoodsCraft" => array("listorder"=>"craft_listorder", "_on"=>"ProduceProcess.goods_id=GoodsCraft.goods_id", "_type"=>"left"),
        "Goods" => array("name"=>"goods_name", "_on"=>"ProduceProcess.goods_id=Goods.id","_type"=>"left")
    );
    
    /**
     * 为产品列表赋予生产工序信息
     * 如没有信息，则取该产品的第一道工序
     * 
     * @params $data => ProducePlanDetail list
     */
    public function assignProcessData($data, $isId=false) {
        
        if($isId) {
            $produceDetailIds = $data;
            $model = D("ProducePlanDetail");
            $data = $model->where(array(
                "id" => array("IN", implode(",", $data))
            ))->select();
        } else {
            foreach($data as $row) {
                $produceDetailIds[] = $row["id"];
            }
        }
        
        /**
         * 取得所有已进入生产工序的最后一个进程信息
         */
        $tmp = $this->where(array(
            "ProduceProcess.plan_detail_id" => array("IN", implode(",", $produceDetailIds)),
            "ProduceProcess.status" => 0
        ))->order("ProduceProcess.id DESC")->select();
        foreach($tmp as $k=>$v) {
            $processes[$v["plan_detail_id"]] = $v;
        }
//        echo $this->getLastSql();exit;
        $goods_ids = array();
        foreach($data as $k=>$row) {
            if(array_key_exists($row["id"], $processes)) {
                $data[$k]["processes"] = $processes[$row["id"]]; //当前最后一条执行中进程
            } else {
                $data[$k]["processes"] = array();
            }
            
            $goods_ids[] = $row["goods_id"]; //下一工序
        }
        
        //下一工艺节点
        if($goods_ids) {
            $goodsCraftModel = D("GoodsCraftView");
            $map = array(
                "GoodsCraft.goods_id" => array("IN", implode(",", $goods_ids))
            );
            
            $tmp = $goodsCraftModel->where($map)->order("listorder ASC")->select();
//            echo $goodsCraftModel->getLastSql();exit;
            foreach($tmp as $gc) {
                $goodsCrafts[$gc["goods_id"]][$gc["listorder"]] = $gc;
            }
            
            foreach($data as $k=>$row) {
                if(array_key_exists($row["goods_id"], $goodsCrafts)) {
                    //下一道工艺
                    foreach($goodsCrafts[$row["goods_id"]] as $listorder => $gcr) {
                        if($listorder <= $row["processes"]["craft_listorder"]) {
                            continue;
                        } else {
                            $data[$k]["processes"]["next_craft_name"] = $gcr["name"];
                            $data[$k]["processes"]["next_craft_id"] = $gcr["id"];
                            break;
                        }
                    }
                }
            }
        }
        
//        print_r($data);exit;
        
        return $data;
    }
    
}
