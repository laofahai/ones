<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 8/23/14
 * Time: 15:38
 */

class CrmBuild extends CommonBuildAction {

    protected $authNodes = array(
        "crm.relationshipcompanylinkman.*",
        "crm.relationshipcompany.*",
        "crm.relationshipcompanygroup.*"
    );

} 