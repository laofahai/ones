<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of DataModelDataViewModel
 *
 * @author nemo
 */
class DataModelDataViewModel extends CommonViewModel {
    
    protected $viewFields = array(
        "DataModelData" => array("id","source_id","model_id","field_id","data"),
        "DataModel" => array("name" => "model_name",  "_on"=>"DataModel.id=DataModelData.model_id"),
        "DataModelFields" => array("display_name", "field_name ", "_on"=>"DataModelData.field_id=DataModelFields.id")
    );
    
}
