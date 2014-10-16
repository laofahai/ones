<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of StockAction
 *
 * @author nemo
 */
class StockAction extends CommonAction {
    
//    protected function _filter(&$map) {
//        if($_GET["typeahead"]) {
//            $map["_string"] = str_replace("__", $_GET["typeahead"], "name like '%__%' OR pinyin like '%__%'");
//        }
//    }
    
    public function pretreatment() {
        switch($this->_method) {
            case "post":
            case "put":
                $_POST["managers"] = is_array($_POST["managers"]) ? implode(",", $_POST["managers"]) : $_POST["managers"];
                break;
        }

    }

    
    
}
