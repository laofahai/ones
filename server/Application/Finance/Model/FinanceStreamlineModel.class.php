<?php

/*
 * @app Finance
 * @package Finance.model.FinanceStreamline
 * @author laofahai@TEam Swift
 * @link http://ng-erp.com
 * */
namespace Finance\Model;
use Common\Model\CommonViewModel;

class FinanceStreamlineModel extends CommonViewModel {

    protected $viewFields = [
        "FinanceStreamline" => ['*', '_type'=>'left'],
        "FinanceAccount" => [
            'name' => 'finance_account_id__label__',
            'name',
            '_on' => 'FinanceStreamline.finance_account_id=FinanceAccount.id',
            '_type' => 'left'
        ],
        "CommonType" => [
            'name' => 'payment_method__label__',
            '_on' => 'FinanceStreamline.payment_method=CommonType.id',
            '_type' => 'left'
        ]
    ];

}