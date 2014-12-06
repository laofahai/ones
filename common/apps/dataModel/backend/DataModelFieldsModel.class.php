<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of DataModelFieldsModel
 *
 * @author nemo
 */
class DataModelFieldsModel extends CommonModel {
    
    protected $readonlyField = array("model_id");

    public function getFieldsByAlias($alias) {
        $dataModel = D("DataModel")->getByAlias($alias);
        if(!$dataModel) {
            return array();
        }

        return $this->where("model_id=".$dataModel["id"])->select();
    }
    
}
