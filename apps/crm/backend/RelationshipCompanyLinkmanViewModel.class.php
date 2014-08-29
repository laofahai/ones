<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 8/29/14
 * Time: 9:32
 */

class RelationshipCompanyLinkmanViewModel extends CommonViewModel {

    protected $viewFields = array(
        "RelationshipCompanyLinkman"=> array('*', "_type"=>"left"),
        "RelationshipCompany" => array("name"=>"company_name", "_type"=>"left", "_on"=>"RelationshipCompany.id=RelationshipCompanyLinkman.relationship_company_id")
    );

    protected $searchField = array(
        "contact","company_name","mobile","tel",'email',"qq"
    );

} 