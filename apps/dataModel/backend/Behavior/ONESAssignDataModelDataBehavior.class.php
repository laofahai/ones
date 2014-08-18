<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 8/18/14
 * Time: 12:25
 */


class ONESAssignDataModelDataBehavior extends Behavior {

    public function run(&$params) {
        list($rows, $modelIds) = $params;

        $dataModel = D("DataModelDataView");
        $rowData = $dataModel->assignModelData($rows, $modelIds);

        $params = array($rowData, null);
    }

} 