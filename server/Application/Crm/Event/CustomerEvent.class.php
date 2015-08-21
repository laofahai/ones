<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 6/21/15
 * Time: 19:39
 */

namespace Crm\Event;


use Common\Event\BaseRestEvent;

class CustomerEvent extends BaseRestEvent {

    protected function _filter(&$map) {
        if($map['id']) {
            $map['Customer.id'] = $map['id'];
            unset($map['id']);
        }
    }

}