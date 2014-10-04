<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 8/29/14
 * Time: 9:31
 */

class RelationshipCompanyLinkmanAction extends CommonAction {

    protected $indexModel = "RelationshipCompanyLinkmanView";

    protected $readModel = "RelationshipCompanyLinkmanView";

    protected $dataModelAlias = "crmContact";

    protected function _filter(&$map) {
        $map["RelationshipCompany.deleted"] = array("NEQ", 1);
    }

} 