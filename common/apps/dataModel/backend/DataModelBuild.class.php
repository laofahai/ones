<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 8/23/14
 * Time: 16:33
 */

class DataModelBuild extends CommonBuildAction {

    protected $authNodes = array(
        "datamodel.datamodel.*",
        "datamodel.datamodelfields.*",
        "datamodel.datamodeldata.*",
    );

}