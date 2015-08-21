<?php
namespace Account\Service;

use Common\Model\CommonRelationModel;

class CompanyService extends CommonRelationModel {

    public $not_belongs_to_company = true;
    
    protected $_link = array(
        "users" => array(
            "mapping_type" => self::HAS_MANY,
            "class_name"    => "Account/User",
            "foreign_key"   => "id"
        ),
        "apps" => array(
            "mapping_type" => self::MANY_TO_MANY,
            "class_name"    => "Home/App",
            "foreign_key"   => "company_id",
            "relation_foreign_key" => "app_id",
            "relation_table" => "company_active_apps"
        )
    );
}