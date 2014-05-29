<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of ProducePlanDetailModel
 *
 * @author nemo
 */
class ProducePlanDetailModel extends CommonModel {
    
    /**
     * 根据DETAIL ID获得所有相关的goods_id
     */
    public function getGoodsIds($ids) {
        $details = $this->where(array(
            "id" => array("IN", $ids)
        ))->select();
        
        foreach($details as $d) {
            $goods_ids[] = $d["goods_id"];
        }
        
        return $goods_ids;
    }
    
}
