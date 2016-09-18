<?php
namespace Home\Service;

use Common\Model\CommonModel;
use Home\Service\AppService;

class ConfigService extends CommonModel {

    public $real_table_name = 'Config';

    /*
     * 获取应用配置
     * @param string $app 应用alias
     * @todo 插件修改应用文件加载配置
     * */
    public function get_config_by_app($app) {

        $config = array();

        if($app && AppService::is_app_active($app)) {
//            $configs = F("configs/app/all");
            $config = AppService::$allAppConfigs[$app];
        }

        $config = $config ? $config : array();

        /*
         * 全局文件加载
         * **/
        foreach(AppService::$allAppConfigs as $app=>$app_config) {
            if($app_config['global_include'] && AppService::is_app_active($app)) {
                $config['include'] = array_merge_recursive((array)$config['include'], (array)$app_config['global_include']);
            }

            if($app_config['force_global_include']) {
                $config['include'] = array_merge_recursive((array)$config['include'], (array)$app_config['force_global_include']);
            }

            if($app_config['global_load_modules'] && AppService::is_app_active($app)) {
                $config['load_modules'] = array_merge_recursive((array)$config['load_modules'], (array)$app_config['global_load_modules']);
            }
        }

        tag("before_app_config_response", $config);

        return $config;
    }

    /*
     * 获得app.html中需包含的文件
     * */
    public function get_main_include() {
        $main_include = [];
        foreach(AppService::$allAppConfigs as $app=>$app_config) {
            if(!AppService::is_app_active($app)) {
                continue;
            }

            $app_config['main_include'] = array_key_exists('main_include', $app_config) ? $app_config['main_include'] : [];
            $main_include = array_merge_recursive($main_include, (array)$app_config['main_include']);

        }
        return $main_include;
    }

    /*
     * 更新k=>v配置（数据库存储）
     * */
    public function update_kv_config($data) {
        $company_id = get_current_company_id();

        $exists = $this->where(array(
            'company_id' => $company_id
        ))->select();
        $exists_id = get_array_to_kv($exists, 'id', 'alias');
        $exists = get_array_to_kv($exists, 'val', 'alias');


        foreach($data as $row) {
            if(array_key_exists($row['alias'], $exists)) {
                if($row['val'] == $exists) {
                    continue;
                }
                $this->save(array(
                    'id' => $exists_id[$row['alias']],
                    'val' => $row['val'],
                    'alias' => $row['alias'],
                    'data_type' => $row['data_type'],
                    'app' => $row['app']
                ));
                continue;
            }
            $row['company_id'] = $company_id;
            $this->add($row);
        }

        F(get_company_cache_key('kv_db_configs'), null);
    }

    /*
     * 获得k=>v 配置
     * */
    public function get_kv_config($alias=null) {

        $cache_key = get_company_cache_key('kv_db_configs');
        $cached = F($cache_key);
        if(DEBUG || !$cached) {
            $source = $this->where([])->select();

            $cached = array();
            foreach($source as $row) {
                $cached[$row['alias']] = $row;
            }
            F($cache_key, $cached);
        }

        return $alias ? $cached[$alias] : $cached;
    }

    /*
     *
     * */
    public function get_kv_config_multi($aliases=[]) {
        if(!$aliases) {
            return [];
        }

        $return = [];
        $source = $this->where([])->select();
        foreach($source as $row) {
            if(in_array($row['alias'], $aliases)) {
                $return[$row['alias']] = $row['val'];
            }
        }

        return $return;
    }

}