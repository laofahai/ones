<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of DataModelFieldsAction
 *
 * @author nemo
 */
class DataModelFieldsAction extends CommonAction {
    
    /**
     * 过滤器
     */
    protected function _filter(&$map) {
        if($_GET["pid"]) {
            $_GET["modelId"] = $_GET["pid"];
        }
        if(isset($_GET["modelId"])) {
            $map["model_id"] = abs(intval($_GET["modelId"]));
        }
    }
    
    
    
}
