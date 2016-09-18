<?php

/*
 * @app Finance
 * @package Finance.service.FinanceAccount
 * @author laofahai@TEam Swift
 * @link http://ng-erp.com
 * */
namespace Finance\Service;
use Common\Model\CommonModel;

class FinanceAccountService extends CommonModel {

    protected $_auto = [
        ["company_id", "get_current_company_id", 1, "function"]
    ];

    /*
     * 更新账户余额
     * @param $account_id 更新的账户ID
     * @param $amount  更新的金额
     * */
    public function update_balance($account_id, $amount, $direction = '+') {

        $method = $direction === '+' ? 'setInc' : 'setDec';
        $result = $this->where(['id'=>$account_id])->$method('balance', $amount);

        return $result === false ? false : true;
    }

}