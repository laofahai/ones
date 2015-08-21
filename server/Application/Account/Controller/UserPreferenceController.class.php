<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 6/3/15
 * Time: 10:37
 */

namespace Account\Controller;


use Common\Controller\BaseRestController;
use Common\Lib\Schema;

class UserPreferenceController extends BaseRestController {

    public function on_put() {
        // 手动设定首选项
        if(isset($_POST['key']) && isset($_POST['data'])) {
            $service = D('Account/UserPreference', 'Service');
            return $service->set_preference(
                I('post.key'),
                I('post.data'),
                I('post.append')
            );
        }

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
                "name" => $field,
                "data"   => $value,
                "app"   => $opts[0],
                "data_type" => $opts[1]
            ));
        }

        D('Account/UserPreference', 'Service')->update_kv_config($data);

    }

    public function on_read() {
        $model = D('Account/UserPreference', 'Service');
        $configs = $model->get_preference();
        foreach($configs as $k=>$v) {
            $configs[$k] = Schema::data_field_format($v['data'], $v['data_type']);
        }

        $this->response($configs);
    }

}