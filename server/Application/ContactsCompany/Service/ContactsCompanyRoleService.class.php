<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 5/22/15
 * Time: 10:59
 */

namespace ContactsCompany\Service;


use Common\Model\CommonModel;

class ContactsCompanyRoleService extends CommonModel {

    protected $_auto = [
        array("company_id", "get_current_company_id", 1, "function")
    ];

}