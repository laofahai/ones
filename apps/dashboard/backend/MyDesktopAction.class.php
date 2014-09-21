<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of MyDesktopAction
 *
 * @author nemo
 */
class MyDesktopAction extends CommonAction {
    
    public function _filter(&$map) {
        $map["uid"] = getCurrentUid();
    }

    public function _order(&$order) {
        $order = "listorder DESC";
    }
    
    public function insert() {
        $model = D("MyDesktop");
        $model->where("uid=".$this->user["id"])->delete();
        foreach($_POST as $row) {
            if(!$row["selected"]) {
                continue;
            }
            $model->add(array(
                "uid" => $this->user["id"],
                "name" => $row["name"],
                "listorder"=>$row["listorder"]
            ));
        }
        
    }
    
}
