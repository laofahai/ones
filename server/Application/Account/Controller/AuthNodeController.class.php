<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 5/29/15
 * Time: 21:07
 */

namespace Account\Controller;


use Common\Controller\BaseRestController;

class AuthNodeController extends BaseRestController {

    protected function _filter(&$map) {
        $map['app'] = array('IN', $this->activeApps);
    }

}