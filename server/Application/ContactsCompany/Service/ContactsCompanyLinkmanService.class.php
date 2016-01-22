<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 6/15/15
 * Time: 11:42
 */

namespace ContactsCompany\Service;


use Common\Model\CommonModel;

class ContactsCompanyLinkmanService extends CommonModel {

    protected $_auto = [
        array("user_info_id", "get_current_user_id", 1, "function"),
        array("company_id", "get_current_company_id", 1, "function")
    ];

}