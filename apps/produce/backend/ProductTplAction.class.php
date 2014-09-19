<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of ProductTplAction
 *
 * @author nemo
 */
class ProductTplAction extends CommonAction {
    
    protected $indexModel = "ProductTplView";
    
    protected $readModel = "ProductTplView";
    protected $deleteModel = "ProductTplRel";

    protected $relation = true;
    
    public function index() {

        $data = parent::index(true, false);

        $params = array(
            $data, false
        );
        tag("assign_dataModel_data", $params);

        $this->response($params[0]);
    }
    
    protected function pretreatment() {
        switch($this->_method) {
            case "put":
            case "post":
                $goods = D("Goods")->find($_POST["goods_id"]);
                $_POST["factory_code_all"] = makeFactoryCode($_POST, $goods["factory_code"]);
                //sprintf("%s-%d-%d", $goods["factory_code"], $_POST["standard"], $_POST["version"]);
        }
//        print_r($_POST);exit;
    }
    
    public function read() {
        $data = parent::read(true);
        $data["goods_id_label"] = $data["goods_name"];


        $params = array(
            array($data), false
        );
        tag("assign_dataModel_data", $params);


//        print_r($data);exit;
        $this->response($params[0][0]);
    }
    
//    public function insert() {
//        
//        print_r($_POST);
//        exit;
//        
//    }
    
}
