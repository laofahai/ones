<?php

/*
 * @app Storage
 * @package Storage.service.StockLog
 * @author laofahai@TEam Swift
 * @link http://ng-erp.com
 * */
namespace Storage\Service;
use Common\Model\CommonModel;

class StockLogService extends CommonModel {

    protected $_auto = [
        ["user_info_id", "get_current_user_id", 1, "function"],
        ["company_id", "get_current_company_id", 1, "function"]
    ];

    /*
     * 记录库存操作日志
     * @param string $source_model
     * @param integer $source_id
     * @param string $direction in or out
     * @param integer $product_id
     * @param string $product_unique_id
     * @param decimal $quantity
     * */
    public function record(array $params) {

        $required = ['source_model', 'source_id', 'direction', 'product_id', 'product_unique_id', 'quantity'];

        foreach($required as $req) {
            if(!$params[$req]) {
                return;
            }
        }

        if(!$this->create($params)) {
            return false;
        }

        if(!$this->add()) {
            return false;
        }

    }

}