<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 8/5/15
 * Time: 21:19
 */

namespace Storage\Service;


use Common\Model\CommonModel;

class StockOutDetailService extends CommonModel{
    protected $_auto = [
        array("company_id", "get_current_company_id", 1, "function")
    ];
}