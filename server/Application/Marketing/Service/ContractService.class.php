<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 6/22/15
 * Time: 10:57
 */

namespace Marketing\Service;


use Common\Model\CommonModel;

class ContractService extends CommonModel {

    protected $_auto = array(
        array("user_info_id", "get_current_user_id", 1, "function"),
        array("company_id", "get_current_company_id", 1, "function")
    );

}