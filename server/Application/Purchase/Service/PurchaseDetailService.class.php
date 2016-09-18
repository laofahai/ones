<?php

/*
 * @app Purchase
 * @package Purchase.service.PurchaseDetail
 * @author laofahai@TEam Swift
 * @link http://ng-erp.com
 * */
namespace Purchase\Service;
use Common\Model\CommonModel;

class PurchaseDetailService extends CommonModel {

    protected $_auto = [
        ["company_id", "get_current_company_id", 1, "function"]
    ];

}