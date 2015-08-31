<?php

/*
 * @app Purchase
 * @package Purchase.model.Purchase
 * @author laofahai@TEam Swift
 * @link https://ng-erp.com
 * */
namespace Purchase\Model;
use Common\Model\CommonViewModel;

class PurchaseModel extends CommonViewModel {

    protected $viewFields = [
        "Purchase" => ['*', '_type'=>'left']
    ];

}