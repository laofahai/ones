<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 5/31/15
 * Time: 20:39
 */

namespace Account\Event;


use Common\Event\BaseRestEvent;

class UserInfoEvent extends BaseRestEvent {

    /*
     * 获取当前用户信息
     * */
    public function current() {
        $this->response($this->user);
    }

}