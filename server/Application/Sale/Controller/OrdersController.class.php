<?php

/*
 * @app Sale
 * @package Sale.controller.Orders
 * @author laofahai@TEam Swift
 * @link http://ng-erp.com
 * */
namespace Sale\Controller;
use Common\Controller\CommonBillController;

class OrdersController extends CommonBillController {

    protected $main_model = 'Sale/Orders';

    protected $detail_model_alias = 'sale.ordersDetail';

}