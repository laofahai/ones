<?php

/*
 * @app Account
 * @package Account.controller.CompanyProfile
 * @author laofahai@TEam Swift
 * @link https://ng-erp.com
 * */
namespace Account\Controller;
use Account\Service\CompanyProfileService;
use Common\Controller\BaseRestController;

class CompanyProfileController extends BaseRestController {

    /*
     * @override 更新公司资料
     * */
    public function on_put() {
        $_GET['company_id'] = get_current_company_id();
        if(!$_GET['company_id']) {
            return $this->login_required();
        }

        $service = D('Account/CompanyProfile');
        $service->init_profile();

        $company_service = D('Account/Company');
        $company_service->where()->save([
            'name' => I('post.name')
        ]);

        $_GET['company_id'] = get_current_company_id();

        $_GET['id'] = $service->where([
            'company_id' => $_GET['company_id']
        ])->getField('id');

        parent::on_put();
    }

    /*
     * @override 获取公司资料
     * */
    public function on_read() {
        $_GET['id'] = get_current_company_id();

        $data = parent::on_read(true);

        // 公司基本资料
        $company_base_profile = D('Account/Company')->where([
            'id' => I('get.id')
        ])->find();

        foreach(CompanyProfileService::$need_merge as $nm) {
            $data[$nm] = $company_base_profile[$nm];
        }

        $this->response($data, 'company_profile', 'true');

    }

}