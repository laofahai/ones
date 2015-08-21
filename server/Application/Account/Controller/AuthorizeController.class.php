<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 5/29/15
 * Time: 22:38
 */

namespace Account\Controller;


use Common\Controller\BaseRestController;

class AuthorizeController extends BaseRestController {

    public function on_put() {
        $role_id = I('get.id');
        $data = I('post.');

        $nodes = array();
        foreach($data['nodes'] as $node) {
            array_push($nodes, array(
                'node' => $node,
                'flag' => $data['flag'][$node] ? $data['flag'][$node] : 1
            ));
        }

        $auth = D('Account/Authorize', 'Service');
        if($auth->authorize($role_id, $nodes)) {
            $this->success(__('account.Authorize Success'));
        } else {
            $this->error(__('account.Authorize Failed').': '.$auth->getError());
        }

    }

}