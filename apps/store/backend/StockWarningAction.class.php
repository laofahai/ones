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
        $map["_string"] = "(StockProductList.store_min>0 and num<=StockProductList.store_min)
                        or (StockProductList.store_max>0 and num>=StockProductList.store_max)";
    }
    
    public function index() {

        $data = parent::index(true);
        if($_GET["onlyCount"]) {
            $this->response($data);
        } else {
            foreach($data[1] as $k=>$v) {
                if($v["num"] <= $v["store_min"]) {
                    $data[1][$k]["colorize"] = "red";
                } else {
                    $data[1][$k]["colorize"] = "green";
                }
            }
            $this->response($data);
        }
    }
    
}
