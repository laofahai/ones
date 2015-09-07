<?php

/*
 * @app Purchase
 * @package Purchase.service.Purchase
 * @author laofahai@TEam Swift
 * @link https://ng-erp.com
 * */
namespace Purchase\Service;
use Common\Service\CommonBillService;

class PurchaseService extends CommonBillService {

    protected $_auto = [
        ["user_id", "get_current_user_id", 1, "function"],
        ["company_id", "get_current_company_id", 1, "function"]
    ];

    const STATUS_COMPLETE = 2;

    // 单据主表模型别名 必须
    protected $main_model_alias = 'purchase.purchase';
    // 单据行模型别名 必须
    protected $detail_model_alias = 'purchase.purchaseDetail';
    // 主表外键字段
    protected $detail_main_foreign = 'purchase_id';
    // 主表表名
    protected $main_table = 'purchase';
    // 明细表表名
    protected $detail_table = 'purchase_detail';

    protected $LOCKED_STATUS = [
        self::STATUS_SAVED
    ];

}