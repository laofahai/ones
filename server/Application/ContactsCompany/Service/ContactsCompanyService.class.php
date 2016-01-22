<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 5/22/15
 * Time: 10:38
 */

namespace ContactsCompany\Service;


use Common\Model\CommonModel;

class ContactsCompanyService extends CommonModel {

    protected $_auto = array(
        array("company_id", "get_current_company_id", 1, "function"),
        array("user_info_id", "get_current_user_id", 1, "function")
    );

}