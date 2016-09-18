<?php
namespace Home\Event;
use Account\Service\AuthorizeService;
use Account\Service\UserInfoService;
use Common\Event\BaseRestEvent;
use Common\Lib\Schema;
use Home\Service\AppService;
use Home\Service\ConfigService;

class ConfigEvent extends BaseRestEvent {

//    protected $not_belongs_to_company = true;
    
    protected $supportResponseBaseConfigKeys = array(
        'DEBUG',
        'version',
        'default_language'
    );

    /*
     * 启动所需基本配置
     * **/
    public function bootstrap() {

        $data = array();
        foreach($this->bootstrapConfigs as $k=>$v) {
            if(in_array($k, $this->supportResponseBaseConfigKeys)) {
                $data[$k] = $v;
            }
        }

        $data['DEBUG'] = APP_DEBUG ? true : false;

        // 已启用应用
        $data['loaded_apps'] = array_merge(AppService::$activeApps, AppService::$baseApps);

        // 已授权节点
        $data['authed_nodes'] = get_array_to_kv(AuthorizeService::$authed_nodes, "flag", "node");

        // 用户信息
        $data['all_users'] = UserInfoService::get_all_basic_data();

        // 当前用户信息
        $data['user_info'] = D('Account/UserInfo')->get_current_user();

        // 系统首选项
        $system_preference = D('Home/Config', 'Service')->get_kv_config();
        foreach($system_preference as $k=>$v) {
            $system_preference[$k] = Schema::data_field_format($v['val'], $v['data_type']);
        }
        $data['system_preference'] = $system_preference;

        // 公司资料
        $company_profile = D('Account/CompanyProfile', 'Model')->where([])->find();
        $data['company_profile'] = $company_profile;

        // 个人首选项
        $user_preference = D('Account/UserPreference', 'Service')->get_preference();

        foreach($user_preference as $k=>$v) {
            $user_preference[$k] = Schema::data_field_format($v['data'], $v['data_type']);
        }
        $data['user_preference'] = $user_preference;

        // 主页面包含
        $data['main_include'] = D('Home/Config', 'Service')->get_main_include();


        tag('before_bootstrap_config_response', $data);

        $this->response($data);
    }
    
    /*
     * 应用配置
     * **/
    public function app() {
        $config = D('Home/Config')->get_config_by_app(I('get.app_name'));
        $this->response($config);
    }
    
}