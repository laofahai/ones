<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of DataModelAction
 *
 * @author nemo
 */
class DataModelAction extends CommonAction {
    
    protected function _filter(&$map) {
        if($_GET["cat_id"]) {
//            $model = D("GoodsCategory");
//            $category = $model->find($_GET["cat_id"]);
//            if($category) {
//                $map["id"] = $category["bind_model"];
//            }
            $map["alias"] = "product";
        }
    }


    
}
