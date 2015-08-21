<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 6/2/15
 * Time: 09:11
 */

namespace Account\Event;


use Common\Event\BaseRestEvent;
use Common\Lib\Schema;

class UserPreferenceEvent extends BaseRestEvent {

    public function on_read() {
        $model = D('Account/UserPreference', 'Service');
        $configs = $model->get_preference();
        foreach($configs as $k=>$v) {
            $configs[$k] = Schema::data_field_format($v['data'], $v['data_type']);
        }

        $configs = I('get.key') ? $configs[I('get.key')] : $configs;

        $this->response($configs);
    }

    public function on_list() {
        return $this->on_read();
    }

}