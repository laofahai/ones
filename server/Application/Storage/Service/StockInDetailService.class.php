<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 7/15/15
 * Time: 23:42
 */

namespace Storage\Service;


use Common\Model\CommonModel;

class StockInDetailService extends CommonModel {

    protected $_auto = [
        array("company_id", "get_current_company_id", 1, "function")
    ];

}