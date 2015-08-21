<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 5/19/15
 * Time: 20:56
 */

namespace Common\Event;


use Common\Controller\BaseRestController;

class BaseRestEvent extends BaseRestController {

    public function index() {
        return $this->on_event_list();
    }

    public function read() {
        return $this->on_event_read();
    }

    public function on_event_list() {
        return $this->on_list();
    }

    public function on_event_read() {
        return $this->on_read();
    }

}