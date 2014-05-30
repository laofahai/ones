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
    
//    public function index() {
//        $model = D("Stockout");
//    }
    
    public function read() {
        if($_GET["workflow"]) {
            parent::read();
            return;
        }
        $model = D("Stockout");
        $data = $model->getStockoutBill($_GET["id"]);
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
