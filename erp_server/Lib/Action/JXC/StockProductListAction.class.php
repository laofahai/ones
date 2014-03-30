<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of StockProductListAction
 *
 * @author nemo
 */
class StockProductListAction extends CommonAction {
    
    protected $indexModel = "StockProductListView";
    
    protected function _filter(&$map) {
        if($_GET["id"]) {
            unset($map["id"]);
            $map["stock_id"] = abs(intval($_GET["id"]));
        }
        if($_GET["factory_code_all"]) {
            $map["factory_code_all"] = $_GET["factory_code_all"];
        }
    }
    
}
