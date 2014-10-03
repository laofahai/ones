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
        "DataModelData" => array("*", "_type"=>"left"),
        "DataModel" => array("name" => "model_name",  "_on"=>"DataModel.id=DataModelData.model_id", "_type"=>"left"),
        "DataModelFields" => array("display_name", "field_name ", "extra_data", "_on"=>"DataModelData.field_id=DataModelFields.id", "_type"=>"left")
    );

    /**
     * 包含模型数据
     * @param $sourceData 源多条数据
     * @param $modelDataIds 所有包含的模型ID
     * @param $modelAlias
     */
    public function assignModelData($sourceData, $modelDataIds = false) {

        $modelData = array();

        //无model data id时
        if(!$modelDataIds or $modelDataIds === "product") {
            $modelDataIds = array();
            foreach($sourceData as $k=>$v) {
                if($v["factory_code_all"]) {
                    $tmp = explode(DBC("goods.unique.separator"), $v["factory_code_all"]); //根据factory_code_all factory_code - standard - version
                    $factory_code = array_shift($tmp);
                    $modelDataIds = array_merge($modelDataIds, $tmp);
                    $sourceData[$k]["modelIds"] = $tmp;
                }
            }
        //model data id为product modelAlias时
        } else if(!is_array($modelDataIds)) {
            // $modelDataIds为模型alias
            $dataModelObject = D("DataModel");
            $theDataModel = $dataModelObject->getByAlias($modelDataIds);

            foreach($sourceData as $v) {
                $sourceIds[$v["id"]] = $v["id"];
            }

            $tmp  = $this->where(array(
                "model_id" => $theDataModel["id"],
                "source_id" => array("IN", implode(",", $sourceIds))
            ))->select();


            $modelDataIdsQueryd = array();
            foreach($tmp as $v) {
                $modelDataIdsQueryd[$v["source_id"]][] = $v["id"];
                $modelData[$v["id"]] = $v;
            }

            foreach($sourceData as $k=>$v) {
                $sourceData[$k]["modelIds"] = $modelDataIdsQueryd[$v["id"]];
            }

            $modelDataIds = $modelDataIdsQueryd;
        }

        if(empty($modelDataIds)) {
            return $sourceData;
        }

        if(!$modelData) {

            $tmp = $this->where(array(
                "id" => array("IN", implode(",", $modelDataIds))
            ))->select();

            foreach($tmp as $v) {
                $modelData[$v["id"]] = $v;
            }
        }

        foreach($sourceData as $k=>$v) {
            if(!$v["modelIds"]) {
                continue;
            }
            foreach($v["modelIds"] as $mid) {
                $fieldConf = explode("\n", $modelData[$mid]["extra_data"]);
                if(in_array("bindToLabel::true", $fieldConf)) {
                    $sourceData[$k][$modelData[$mid]["field_name"]] = $mid;
                    $sourceData[$k][$modelData[$mid]["field_name"]."_label"] = $modelData[$mid]["data"];
                } else {
                    $sourceData[$k][$modelData[$mid]["field_name"]] = $modelData[$mid]["data"];
                }

            }
        }

        return $sourceData;
    }

}
