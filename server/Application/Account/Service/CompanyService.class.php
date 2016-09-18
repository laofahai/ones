<?php
namespace Account\Service;

use Common\Model\CommonRelationModel;

class CompanyService extends CommonRelationModel {

    public $not_belongs_to_company = true;
    
    protected $_link = array(
        "users" => array(
            "mapping_type" => self::HAS_MANY,
            "class_name"    => "Account/UserInfo",
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

    /*
     * 清除本公司的缓存
     * */
    public static function clearCache() {
        $company_id = get_current_company_id();
        if(!$company_id) {
            return false;
        }
        $path = ENTRY_PATH."/Runtime/Data/company/".$company_id;
        if(strtoupper(substr(PHP_OS, 0, 3)) == 'WIN') {
            $command = "rmdir /s/q " . $path;
        } else {
            $command = "rm -Rf " . $path;
        }

        exec($command);
    }
}