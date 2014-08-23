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

        $dataModelDataObject = D("DataModelData");
        $dataModelDataObject->excludeDeletedMap = true;
        $dataModelDataObject->where(array(
            "source_id" => $id,
            "model_id"  => $dataModel["id"]
        ))->delete();

    }
} 