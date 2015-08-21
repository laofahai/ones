<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 6/3/15
 * Time: 17:53
 */

namespace Account\Event;


use Account\Service\AuthNodeService;
use Common\Event\BaseRestEvent;

class AuthNodeEvent extends BaseRestEvent {

    /*
     * 获得节点授权flag
     * */
    public function get_auth_node_flags() {
        $this->response(D('Account/AuthNode', 'Service')->get_flags());
    }

}