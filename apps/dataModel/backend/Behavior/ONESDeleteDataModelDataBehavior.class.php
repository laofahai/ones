<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 8/21/14
 * Time: 0:02
 */

class ONESDeleteDataModelDataBehavior extends Behavior {

    public function run(&$params) {
        list($id, $bindModelAlias) = $params;

        $modelObject = D("DataModel");
        $dataModel = $modelObject->getByAlias($bindModelAlias);

        $map = array(
            "model_id"  => $dataModel["id"]
        );

        if(is_array($id)) {
            $map["source_id"] = array("IN", implode(",",$id));
        } else {
            $map["source_id"] = $id;
        }

        $dataModelDataObject = D("DataModelData");
        $dataModelDataObject->excludeDeletedMap = true;
        $dataModelDataObject->where($map)->delete();

    }
} 