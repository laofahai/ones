<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 8/18/14
 * Time: 15:42
 *
 * 用于手动插入模型数据
 * @todo 模型数据验证
 */

class ONESInsertDataModelDataBehavior extends Behavior {

    /*
     * @param $bindModelAlias string 使用的数据模型别名
     * @param $data array POST的数据，根据数据模型查询字段之后从此数组中取值，单条数据
     * **/
    public function run(&$params) {
        list($bindModelAlias, $data, $pinyin) = $params;

        if(!$data["id"]) {
            return false;
        }

        $modelObject = D("DataModel");
        $dataModel = $modelObject->getByAlias($bindModelAlias);

        if(!$dataModel) {
            Log::write("try to insert model data but dataModel not found: ".$bindModelAlias);
            return false;
        }

        $fieldsModelObject = D("DataModelFields");
        $tmp = $fieldsModelObject->where("model_id=".$dataModel["id"])->select();

        $modelFields = array();
        $modelFieldsAlias = array();
        foreach($tmp as $row) {
            $modelFieldsAlias[] = $row["field_name"];
            $modelFields[$row["field_name"]] = $row;
        }

        //数据
        foreach($data as $k=>$v) {
            if(in_array($k, $modelFieldsAlias)) {
                if(isset($data[$k."_label"])) {
                    $modelData[$k] = isset($data[$k."_label"]);
                } else {
                    $modelData[$k] = $v;
                }
            }
        }

        $dataModelObject = D("DataModelData");
        $dataModelObject->where(array(
            "source_id" => $data["id"],
            "model_id" => $dataModel["id"],
        ))->delete();

        foreach($modelData as $fieldName=>$fieldValue) {
            $dataModelObject->add(array(
                "source_id" => $data["id"],
                "model_id"  => $modelFields[$fieldName]["model_id"],
                "field_id"  => $modelFields[$fieldName]["id"],
                "data" => $fieldValue,
                "pinyin" => $pinyin ? Pinyin($fieldValue) : "",
                "deleted" => 0
            ));
        }

        /*
         * source_id
         * model_id
         * field_id
         * data
         * pinyin
         * deleted
         * **/


    }
} 