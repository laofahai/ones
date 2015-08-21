<?php

namespace Storage\Controller;
use Common\Controller\CommonBillController;

class StockInController extends CommonBillController {


    protected $main_model = 'Storage/StockIn';

    protected $detail_model_alias = 'storage.stockInDetail';


}