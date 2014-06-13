<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of MyDesktopModel
 *
 * @author nemo
 */
class MyDesktopModel extends CommonModel {
    
    public function getDesks($uid) {
        $tmp = $this->where(array(
            "uid"=> $uid
        ))->select();
        foreach($tmp as $k=>$v) {
            $selected[$v["desk_id"]] = $v;
        }
        
        $all = D("UserDesktop")->select();
        
        foreach($all as $k=>$v) {
            if(array_key_exists($v["id"], $selected)) {
                $all[$k]["selected"] = true;
                $all[$k]["listorder"] = $selected[$v["id"]]["listorder"];
            }
            $all[$k]["listorder"] = intval($all[$k]["listorder"]);
        }
        
        return $all;
    }
    
}
