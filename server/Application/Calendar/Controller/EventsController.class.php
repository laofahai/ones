<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 6/9/15
 * Time: 15:36
 */

namespace Calendar\Controller;


use Common\Controller\BaseRestController;

class EventsController extends BaseRestController {

    protected function _filter(&$map) {
        if(!I('get._ia')) {
            $map['user_info_id'] = get_current_user_id();
        }
    }

    protected function _order(&$order) {
        $order = "start_at ASC";
    }

    protected function _before_insert() {
        $_POST['start_at'] = format_form_js_date($_POST['start_at']);
        $_POST['end_at'] = format_form_js_date($_POST['end_at']);
        $_POST['user_info_id'] = get_current_user_id();

    }
    protected function _before_update() {
        $_POST['start_at'] = format_form_js_date($_POST['start_at']);
        $_POST['end_at'] = format_form_js_date($_POST['end_at']);
    }

}