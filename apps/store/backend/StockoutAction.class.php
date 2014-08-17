<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of StockoutAction
 *
 * @author nemo
 */
class StockoutAction extends CommonAction {
    
    protected $workflowAlias = "stockout";
    
    protected $indexModel = "StockoutView";
    
    protected function _filter(&$map) {
        if(isset($_GET["unhandled"])) {
            $map["status"] = array("LT", 1);
        }
        
        if(isset($_GET["handled"])) {
            $map["status"] = array("EGT", 1);
        }
    }
    
//    public function index() {
//        $model = D("Stockout");
//    }
    
    public function read() {
        if($_GET["workflow"]) {
            parent::read();
            return;
        }
        $model = D("StockoutView");
        if(false === strpos($_GET["id"], ",")) {
            $data = $model->getStockoutBill($_GET["id"]);
        } else {
            //多条数据
            $data["datas"] = $model->getStockoutBillsByIds(explode(",", $_GET["id"]));
        }
//        print_r($data);exit;
        $this->response($data);
        exit;
        $data = parent::read(true);
        /**
         * 工作流执行中
         */
//        print_r($data);
//        
//        exit;
        $this->response($data);
    }
    
}
