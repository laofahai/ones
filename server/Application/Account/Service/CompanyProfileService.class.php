<?php

/*
 * @app Account
 * @package Account.service.CompanyProfile
 * @author laofahai@TEam Swift
 * @link http://ng-erp.com
 * */
namespace Account\Service;
use Common\Model\CommonModel;
use Home\Service\SchemaService;

class CompanyProfileService extends CommonModel {

    public $not_belongs_to_company = true;

    static public $need_merge = ['name'];

    /*
     * 初始化公司资料条目信息
     * */
    public function init_profile() {
        $company_id = get_current_company_id();
        $exists = $this->where([
            'company_id' => $company_id
        ])->find();

        if(!$exists) {
            $data = [
                'company_id' => $company_id
            ];
            $this->create($data);
            return $this->add();
        }
    }

    /*
     * 获取公司资料表结构
     * 将company表中部分字段合并
     * */
    public function get_schema() {

        $profile_schema = SchemaService::getSchemaByTable('company_profile', 'account');
        $company_schema = SchemaService::getSchemaByApp('account', 'company');

        foreach($company_schema['company']['structure'] as $field) {
            if(in_array($field['field'], self::$need_merge)) {
                array_unshift($profile_schema['structure'], $field);
            }
        }

        return $profile_schema;
    }

}