<?php

/*
 * @app Purchase
 * @package Purchase.model.PurchaseDetail
 * @author laofahai@TEam Swift
 * @link https://ng-erp.com
 * */
namespace Purchase\Model;
use Common\Model\CommonViewModel;

class PurchaseDetailModel extends CommonViewModel {

    protected $viewFields = [
        "PurchaseDetail" => ['*', '_type'=>'left']
    ];

}