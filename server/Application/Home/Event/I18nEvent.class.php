<?php

namespace Home\Event;
use Common\Event\BaseRestEvent;
use Home\Service\AppService;
use Home\Service\ConfigService;
use Common\Lib\RecursiveFileFilterIterator;

class I18nEvent extends BaseRestEvent {

    protected $not_belongs_to_company = true;
    
    /*
     * 返回语言包
     * **/
    public function on_event_list() {

        $apps_get = I('get.apps');

        if($apps_get === "all" or true) {
            $apps = array_merge((array)get_array_to_kv(D('Home/App')->select(), 'alias'), $this->baseApps);
        } else {
            $apps = explode(',', $apps_get);
            // 应用requirements
            foreach($apps as $app) {
                $app_config = ConfigService::get_config_by_app($app);
                if($app_config['requirements']) {
                    $apps = array_merge($apps, (array)$app_config['requirements']);
                }
            }
        }

        array_unshift($apps, 'common');
        $apps = array_unique($apps);
//        if($apps !== array("common", "account") && !$this->is_login()) {
//            $this->login_required();
//        }

        foreach($this->appConfigs as $_app => $_config) {
            if($_config['i18n_global_loaded']) {
                array_push($apps, $_app);
            }
        }
        $apps = array_unique($apps);

        $cache_key = sprintf('i18n/%s/all', CURRENT_LANGUAGE);
        $langs = F($cache_key);
        if(DEBUG || !$langs) {
            $langs = self::make_i18n_cache($cache_key);
        }

        $return = array();
        foreach($apps as $app) {
            if($apps_get !== 'all' && $app !== "common" && !AppService::is_app_active($app)) {
                continue;
            }

            $return[$app] = $langs[$app];
        }

        $this->response($return);
    }

    static function make_i18n_cache($cache_key) {
        $langs = array();
        foreach (new RecursiveFileFilterIterator(APP_PATH, CURRENT_LANGUAGE.".yml") as $item) {
            $app = lcfirst(basename(dirname(dirname($item))));
            $langs[$app] = parse_yml($item);
        }

        F($cache_key, $langs);
        return $langs;
    }
    
}