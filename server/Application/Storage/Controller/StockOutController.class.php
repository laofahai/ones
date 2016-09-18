<?php

/*
 * @app Storage
 * @package Storage.controller.StockOut
 * @author laofahai@TEam Swift
 * @link http://ng-erp.com
 * */
namespace Storage\Controller;
use Common\Controller\CommonBillController;

class StockOutController extends CommonBillController {

    protected $main_model = 'Storage/StockOut';

    protected $detail_model_alias = 'storage.stockOutDetail';

}