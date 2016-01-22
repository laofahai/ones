<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 6/14/15
 * Time: 23:36
 */

namespace Crm\Service;


use Common\Model\CommonModel;

class CustomerHeadLogService extends CommonModel{

    // 领取线索
    const TYPE_COLLECT = 1;

    // 释放线索
    const TYPE_RELEASE = 2;

    // 分配线索
    const TYPE_DISPATCH = 3;

    // 转化为客户
    const TYPE_TRANSFORM = 4;

    const TYPE_COLLECT_CUSTOMER = 5;

    const TYPE_RELEASE_CUSTOMER = 6;

    CONST TYPE_DISPATCH_CUSTOMER = 3;

    protected $_auto = array(
        array("user_info_id", "get_current_user_id", 1, "function"),
        array("company_id", "get_current_company_id", 1, "function")
    );



}