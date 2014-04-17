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
    
    /**
     * 包含模型数据
     * @param $sourceData 源多条数据
     */
    public function assignModelData($sourceData, $modelIds) {
        if(false === $modelIds) {
            $modelIds = array();
            foreach($sourceData as $k=>$v) {
                if(!$v["factory_code_all"]) {
                    continue;
                }
                $tmp = explode("-", $v["factory_code_all"]); //根据factory_code_all factory_code - standard - version
                $factory_code = array_shift($tmp);
                $modelIds = array_merge($modelIds, $tmp);
                
                $sourceData[$k]["modelIds"] = $tmp;
            }
        }
        if(empty($modelIds)) {
            return $sourceData;
        }
        
        $modelData = array();
        $tmp = $this->where(array(
            "id" => array("IN", implode(",", $modelIds))
        ))->select();
        
        foreach($tmp as $v) {
            $modelData[$v["id"]] = $v;
        }
        foreach($sourceData as $k=>$v) {
//            print_r($v);exit;
            if(!$v["modelIds"]) {
                continue;
            }
            foreach($v["modelIds"] as $mid) {
                $sourceData[$k][$modelData[$mid]["field_name"]] = $mid;
                $sourceData[$k][$modelData[$mid]["field_name"]."_label"] = $modelData[$mid]["data"];
            }
        }
        
        return $sourceData;
    }
    
}
