<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 5/31/15
 * Time: 22:08
 */

namespace Account\Service;


use Common\Model\CommonModel;

class AuthRoleService extends CommonModel {
    protected $_auto = array(
        array("company_id", "get_current_company_id", 1, "function")
    );
}