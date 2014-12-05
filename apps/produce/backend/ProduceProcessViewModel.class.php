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
        "GoodsCraft" => array("listorder"=>"craft_listorder", "_on"=>"ProduceProcess.goods_id=GoodsCraft.goods_id AND ProduceProcess.craft_id=GoodsCraft.craft_id", "_type"=>"left"),
        "Goods" => array("name"=>"goods_name", "_on"=>"ProduceProcess.goods_id=Goods.id","_type"=>"left")
    );
    
    /**
     * 为产品列表赋予生产工序信息
     * 如没有信息，则取该产品的第一道工序
     * 
     * @params $data => ProducePlanDetail list
     * @todo 最后一道工序时标识生产完成 ProducePlanDetail.status = 2
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
            "ProduceProcess.plan_detail_id" => array("IN", implode(",", $produceDetailIds))
        ))->order("ProduceProcess.id DESC")->select();
        $processes = array();
        foreach($tmp as $k=>$v) {
            if($processes[$v["plan_detail_id"]]) {
                continue;
            }
            $processes[$v["plan_detail_id"]] = $v;
        }
//        print_r($processes);exit;
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
            //取得所有列表产品需用到的工艺
            $tmp = $goodsCraftModel->where($map)->select();
//            echo $goodsCraftModel->getLastSql();exit;
            foreach($tmp as $gc) {
                $goodsCrafts[$gc["goods_id"]][$gc["listorder"]] = $gc;
            }
//            print_r($goodsCrafts[$row["goods_id"]]);exit;
//            print_r($data);exit;
            foreach($data as $k=>$row) {
                if(array_key_exists($row["goods_id"], $goodsCrafts)) {
                    //下一道工艺
                    foreach($goodsCrafts[$row["goods_id"]] as $listOrder => $gcr) {
                        if($listOrder == $row["processes"]["craft_listorder"]+1) {
//                            print_r($row["processes"]);
//                            print_r($gcr);
//                            echo $listOrder;exit;
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
