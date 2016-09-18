<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 6/6/15
 * Time: 22:08
 */

namespace Home\Controller;


use Account\Service\CompanyService;
use Common\Controller\BaseRestController;
use Common\Lib\Schema;

class ConfigController extends BaseRestController {

    public function on_put() {
        $post = I('post.');
        $ignore = array('_data_model_fields_');

        $data = array();

        foreach($post as $field=>$value) {
            if(in_array($field, $ignore)) {
                continue;
            }

            if(substr($field, -5) == "_opts") {
                continue;
            }

            $opts = explode(',', I('post.'.$field.'_opts'));

            array_push($data, array(
                "alias" => $field,
                "val"   => $value,
                "app"   => $opts[0],
                "data_type" => $opts[1]
            ));
        }

//        print_r($data);exit;

        D('Home/Config', 'Service')->update_kv_config($data);
    }

    public function on_read() {
        $model = D('Home/Config', 'Service');
        $configs = $model->get_kv_config();
        foreach($configs as $k=>$v) {
            $configs[$k] = Schema::data_field_format($v['val'], $v['data_type']);
        }

        $this->response($configs);
    }

    public function _EM_clear_cache() {
        CompanyService::clearCache();
        $this->success(__("common.Operation Success"));
    }

}