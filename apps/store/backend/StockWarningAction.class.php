<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of StockWarningAction
 *
 * @author nemo
 */
class StockWarningAction extends CommonAction {

    protected $indexModel = "StockProductListView";

    protected function _filter(&$map) {
        $map["_string"] = "(store_min>0 and num<=store_min) or (store_max>0 and num>=store_max)";
    }
    
    public function index() {

        $data = parent::index(true);
        if($_GET["onlyCount"]) {
            $this->response($data);
        } else {
            foreach($data as $k=>$v) {
                if($v["num"] <= $v["store_min"]) {
                    $data[$k]["colorize"] = "red";
                } else {
                    $data[$k]["colorize"] = "green";
                }
            }
            $this->response($data);
        }
    }
    
}
