<?php

/*
 * @app Purchase
 * @package Purchase.controller.Purchase
 * @author laofahai@TEam Swift
 * @link http://ng-erp.com
 * */
namespace Purchase\Controller;
use Common\Controller\CommonBillController;

class PurchaseController extends CommonBillController {

    protected $main_model = 'Purchase/Purchase';

    protected $detail_model_alias = 'purchase.purchaseDetail';

    protected function _filter(&$map) {}

}