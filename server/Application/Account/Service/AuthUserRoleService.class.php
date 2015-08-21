<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 8/8/15
 * Time: 09:00
 */

namespace Account\Service;


use Common\Model\CommonModel;

class AuthUserRoleService extends CommonModel {
    protected $_auto = array(
        array("company_id", "get_current_company_id", 1, "function")
    );
}