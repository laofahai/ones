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
    
    public function index() {
        if($_GET["onlyUsed"]) {
            $model = D("MyDesktopView");
            $data = $model->where("uid=".$this->user["id"])->order("MyDesktop.listorder DESC")->select();
            $this->response($data);
        } else {
            $model = D("MyDesktop");
            $this->response($model->getDesks($this->user["id"]));
        }
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
                "desk_id" => $row["id"],
                "listorder"=>$row["listorder"]
            ));
        }
        
    }
    
}
