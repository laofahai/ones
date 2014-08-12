<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of GoodsCraftModel
 *
 * @author nemo
 */
class GoodsCraftModel extends CommonModel {
    
    public function updateGoodsCraft($id, $data) {
        $this->startTrans();
        $this->where("goods_id=".$id)->delete();
        foreach($data as $k=>$v) {
            if($v["listorder"] <= 0) {
                continue;
            }
            
            if(!$this->add(array(
                "goods_id" => $id,
                "craft_id" => $v["id"],
                "listorder"=> $v["listorder"]
            ))) {
//                echo $this->getLastSql();exit;
                Log::write("SQL Error:".$this->getLastSql(), Log::SQL);
                $this->rollback();
                return false;
            }
            
        }
        
        $this->commit();
        return true;
    }
    
}
