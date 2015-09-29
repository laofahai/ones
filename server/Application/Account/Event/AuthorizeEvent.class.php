<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 5/29/15
 * Time: 22:21
 */

namespace Account\Event;

use Common\Event\BaseRestEvent;

class AuthorizeEvent extends BaseRestEvent {

    protected function _filter(&$map) {
        $map['Authorize.company_id'] = get_current_company_id();
        $map['Authorize.auth_role_id'] = I('get.auth_role_id');
    }

}