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
    
    public function pretreatment() {
        switch($this->_method) {
            case "post":
                $_POST["managers"] = implode(",", $_POST["managers"]);
                break;
            case "put":
                $_POST = I("put.");
                $_POST["managers"] = implode(",", $_POST["managers"]);
                break;
        }
    }
    
}
