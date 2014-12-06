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
        $dataModelFields = $model->where(array(
            "model_id" => $theModel["id"],
            "deleted"  => 0
        ))->select();

        if(!$dataModelFields) {
            return $params;
        }

        //字段顺序
        if($params["after"]) {
            $binded = false;
            $tmp = array();
            foreach($params["fields"] as $k=> $p) {
                if($p === $params["after"] && !$binded) {
                    $binded = true;
                    $tmp[$k] = $p;
                    foreach($dataModelFields as $f) {
                        $tmp[$f["field_name"]] = $f["display_name"];
                    }

                } else {
                    $tmp[$k] = $p;
                }
            }

            $params["fields"] = $tmp;

        } else {
            foreach($dataModelFields as $f) {
                $params["fields"][$f["field_name"]] = $f["display_name"];
            }
        }


    }

} 