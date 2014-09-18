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
class StockoutAction extends CommonBillAction {
    
    protected $workflowAlias = "stockout";
    
    protected $indexModel = "StockoutView";

    //被保护状态  不能再修改
    protected $protectedStatus = 1;
    
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
            $data = parent::read(true);
            $data["dateline"]*=1000;
            $this->response($data);
            return;
        }

        $model = D("StockoutView");

        $data = array();

        if(false === strpos($_GET["id"], ",")) {
            $data = $model->getStockoutBill($_GET["id"]);
            if(!$data) {
                $this->httpError(404);
                return;
            }
            $data["dateline"]*=1000;
        } else {
            //多条数据
            $data["datas"] = $model->getStockoutBillsByIds(explode(",", $_GET["id"]));
            if(!$data["datas"]) {
                $this->httpError(404);
                return;
            }
            foreach($data["datas"] as $k=>$v) {
                $data["datas"][$k]["dateline"] *= 1000;
            }
        }
//        print_r($data);exit;
        $this->response($data);
//        exit;
//        $data = parent::read(true);
        /**
         * 工作流执行中
         */
//        print_r($data);
//        
//        exit;
//        $this->response($data);
    }



//    public function insert() {
//        if($_REQUEST["workflow"]) {
//            return parent::doWorkflow();
//        }
//        $model = D("Stockout");
//        if(!$model->newBill($_POST)) {
//            $this->error($model->getError());
//        }
////        print_r($data);exit;
//    }
//
//    public function update() {
//        if($_REQUEST["workflow"]) {
//            return parent::doWorkflow();
//        }
//        $model = D("Stockout");
//        if($model->editBill($_POST)) {
//            $this->error($model->getError());
//        }
//    }
    
}
