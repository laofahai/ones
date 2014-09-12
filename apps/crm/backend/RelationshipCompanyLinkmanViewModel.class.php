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

    public $searchFields = array(
        "RelationshipCompanyLinkman.contact",
        "RelationshipCompanyLinkman.mobile",
        "RelationshipCompanyLinkman.tel",
        'RelationshipCompanyLinkman.email',
        "RelationshipCompanyLinkman.qq",
        "RelationshipCompany.name"
    );

} 