<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 6/6/15
 * Time: 08:52
 */

namespace Home\Controller;


use Common\Controller\BaseRestController;

class CommonTypeController extends BaseRestController {

    protected function _order(&$order) {
        $order = 'listorder DESC, id ASC';
    }

}