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

        $company_service = D('Account/Company');
        $buyModel = D('Account/CompanyBuyApps');

        $company_info = $company_service->where(['id'=>$company_id])->find();
        $buy_history = $buyModel->where(['company_id'=>$company_id])->select();
        $buy_history = get_array_to_ka($buy_history, 'app_id');

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

            if(!array_key_exists($app['id'], $buy_history)) {
                if($company_info['balance'] < $app['price']) {
                    $this->error_code = 1001;
                    $this->error = __('home.Balance not full');
                    return false;
                }

                $company_service->where(['id'=>$company_id])->setDec('balance', $app['price']);
            }


            // 检测依赖
            if(trim($app['requirements'])) {
                $requirements = explode(',', $app['requirements']);
                foreach($requirements as $req) {
                    if($req != $app['alias'] && !self::is_app_active($req)) {
                        if(!$this->enable($req)) {
                            $this->error = $this->getError();
                            return false;
                        }
                    }
                }
            }
            if(!$model->add(array(
                'company_id' => $company_id,
                'app_id' => $app['id']
            ))) {
                return false;
            }

            if(!array_key_exists($app['id'], $buy_history)) {
                $buyModel->add([
                    'company_id' => $company_id,
                    'app_id' => $app['id']
                ]);
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