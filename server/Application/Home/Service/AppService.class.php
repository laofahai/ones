<?php
namespace Home\Service;
use Common\Model\CommonModel;

class AppService extends CommonModel {

    static public $activeApps = array();

    static public $baseApps = array();

    static public $allAppConfigs = array();

    public $not_belongs_to_company = true;

    /*
     * 是否已启用应用
     * */
    static public function is_app_active($app) {
        return in_array($app, self::$activeApps) || in_array($app, self::$baseApps);
    }

    /*
     * 记录启用应用
     * **/
    static public function active($active_app, $base_app) {
        self::$activeApps = $active_app;
        self::$baseApps = $base_app;
    }

    // 启用应用
    public function enable($alias) {
        if(!is_array($alias)) {
            $alias = [$alias];
        }
        $apps = array_diff($alias, array_diff(self::$activeApps, self::$baseApps));
        $company_id = get_current_company_id();

        if(!$apps) {
            return true;
        }

        $apps_info = $this->where(array(
            'alias' => array('IN', $apps)
        ))->select();

        if(!$apps_info) {
            return true;
        }

        $model = D('Account/CompanyActiveApps');
        foreach($apps_info as $app) {

            // 检测依赖
            // @todo 商业应用
            if(trim($app['requirements'])) {

                $requirements = explode(',', $app['requirements']);
                foreach($requirements as $req) {
                    if(!self::is_app_active($req)) {
                        $this->enable($req);
                    }
                }
            }

            if(!$model->add(array(
                'company_id' => $company_id,
                'app_id' => $app['id']
            ))) {
                return false;
            }
        }

        return true;
    }

    /*
     * 禁用应用
     * @todo 提示依赖应用
     * */
    public function disable($alias) {
        $apps_info = $this->where(array(
            'alias' => array('IN', $alias)
        ))->select();

        if(!$apps_info) {
            return true;
        }

        $model = D('Account/CompanyActiveApps');
        return $model->where(array(
            'app_id' => array('IN', get_array_to_kv($apps_info, 'id')),
            'company_id' => get_current_company_id()
        ))->delete();
    }


}