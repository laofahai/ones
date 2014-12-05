<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of ProduceProcessModel
 *
 * @author nemo
 */
class ProduceProcessModel extends CommonModel {
    
    /**
     * 写入工艺进程
     * @todo 判断是否当前生产计划及详情已完成
     */
    public function doProcess($data) {
        $this->startTrans();
        
        foreach($data as $row) {
            $rs = $this->add($row);
            if(!$rs) {
                Log::write("SQL Error:".$this->getLastSql(), Log::SQL);
                $this->rollback();
                return false;
            }
            $detailIds[] = $row['plan_detail_id'];
            $newAddIds[] = $rs;
        }


        if($detailIds) {
            foreach($detailIds as $id) {
                $this->where(array(
                    "plan_detail_id" => $id,
                    "status" => 0,
                    "id" => array("NOT IN", implode(",", $newAddIds))
                ))->save(array(
                    "end_time" => CTS,
                    "status" => 1
                ));
            }

            $detailModel = D("ProducePlanDetail");

            //标识产品已进入生产工序
            $detailModel = D("ProducePlanDetail");
            $detailModel->where(array(
                "id" => array("IN", $detailIds),
                "status" => array("LT", 1)
            ))->save(array(
                "status"=>1,
                "start_time" => CTS
            ));
        }
        
        $this->commit();
        return true;
    }
    
}
