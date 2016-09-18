<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2016/7/20
 * Time: 9:34
 */

namespace Home\Event;


use Common\Event\BaseRestEvent;

class HeartBeatEvent extends BaseRestEvent{

    public function __construct() {}

    public function on_list() {
        session('[start]');
        if(!$_SESSION['user']['id']) {
            $this->response([
                'logged_out' => true
            ]);
        }
    }

}