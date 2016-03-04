<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 5/22/15
 * Time: 10:26
 */

namespace ContactsCompany\Controller;
use Common\Controller\BaseRestController;


class ContactsCompanyController extends BaseRestController {

    public function _before_list_response_($list) {
        $list = D('Region/Region')->merge_region_name_to_list($list);
        return $list;
    }

    public function _before_item_response_($item) {
        $item['region_id__label__'] = D('Region/Region')->get_full_info($item['region_id']);
        return $item;
    }

}