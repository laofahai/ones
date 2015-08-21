<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 6/22/15
 * Time: 11:06
 */

namespace Marketing\Controller;


use Common\Controller\BaseRestController;

class ContractController extends BaseRestController {

    public function _before_insert() {
        $_POST['sale_opportunities_id'] = process_with_item_select_ids('sale_opportunities_id');
        $_POST['head_id'] = process_with_item_select_ids('head_id');
    }

    public function _before_update() {
        $this->_before_insert();
    }

}