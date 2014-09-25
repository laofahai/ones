<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 9/25/14
 * Time: 13:59
 */

class ONESBindDataModelStructureBehavior extends Behavior {

    public function run(&$params){

        $theModel = D("DataModel")->getByAlias($params["dataModelAlias"]);

        if(!$theModel) {
            return $params;
        }

        $model = D("DataModelFields");
        $dataModelFields = $model->where("model_id=".$theModel["id"])->select();

        if(!$dataModelFields) {
            return $params;
        }
        foreach($dataModelFields as $f) {
            $params["fields"][$f["field_name"]] = $f["display_name"];
        }

    }

} 