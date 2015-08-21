<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 6/6/15
 * Time: 11:04
 */

namespace Home\Event;


use Common\Event\BaseRestEvent;

class CommonTypeEvent extends BaseRestEvent {

    protected function _order(&$order) {
        $order = 'listorder DESC, id ASC';
    }

}