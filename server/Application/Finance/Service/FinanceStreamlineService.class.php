<?php

/*
 * @app Finance
 * @package Finance.service.FinanceStreamline
 * @author laofahai@TEam Swift
 * @link http://ng-erp.com
 * */
namespace Finance\Service;
use Common\Model\CommonModel;

class FinanceStreamlineService extends CommonModel {

    protected $_auto = [
        ["user_info_id", "get_current_user_id", 1, "function"],
        ["company_id", "get_current_company_id", 1, "function"]
    ];

    /*
     * 记录财务流水记录
     * 类型： 1进  2出
     * @param [] $params = [
     *  direction: 方向 enum(1,2)
     *  amount: 金额
     *  source_id: 原始收款/付款单据ID
     *  currency: @todo
     *  user_id: 操作员ID 默认当前用户
     *  finance_account_id: 财务账户ID
     * ]
     * */
    public function record($params) {

        if(!$params['amount']) {
            return false;
        }

        $params['user_info_id'] = $params['user_info_id'] ? $params['user_info_id'] : get_current_user_id();
        $params['direction'] = $params['direction'] == 1 ? 1 : 2;

        if(!$params['payment_method']) {
            unset($params['payment_method']);
        }

        $this->create($params);

        $id = $this->add();

        return $id;
    }

}