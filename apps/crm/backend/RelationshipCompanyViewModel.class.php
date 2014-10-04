<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 10/4/14
 * Time: 11:56
 */

class RelationshipCompanyViewModel extends CommonViewModel {

    protected $viewFields = array(
        "RelationshipCompany" => array("*", "_type"=>"left"),
        "RelationshipCompanyGroup" => array("name" => "group_name", "_type"=>"left", "_on"=>"RelationshipCompany.group_id=RelationshipCompanyGroup.id"),
        "User" => array("truename"=>"owner", "_on"=>"RelationshipCompany.user_id=User.id", "_type"=>"left")
    );

    public $searchFields = array(
        "RelationshipCompany.name",
        "RelationshipCompany.pinyin",
        "RelationshipCompany.address"
    );

} 