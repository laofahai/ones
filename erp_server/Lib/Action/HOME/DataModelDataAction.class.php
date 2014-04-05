<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of DataModelDataAction
 *
 * @author nemo
 */
class DataModelDataAction extends CommonAction {
    
    protected $indexModel = "DataModelDataView";
    
    protected function _filter(&$map) {
        if($_GET['fieldAlias']) {
            $map["DataModelFields.field_name"] = $_GET['fieldAlias'];
        }
        if($_GET["id"]) {
            echo 123;exit;
        }
    }
    
    protected function pretreatment() {
        $_POST["model_id"] = $_POST["modelId"];
    }
    
}
