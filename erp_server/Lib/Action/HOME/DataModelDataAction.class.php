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
        //根据分类查询对应的模型
        if($_GET["goods_id"] and strpos($_GET["goods_id"], "_") !== false) {
            list($factory_code, $id, $catid) = explode("_", $_GET["goods_id"]);
            $model = D("GoodsCategory");
            $category = $model->find($catid);
            if($category) {
                $map["model_id"] = $category["bind_model"];
            }
        }
    }
    
    protected function pretreatment() {
        $_POST["model_id"] = $_POST["modelId"];
    }
    
}
