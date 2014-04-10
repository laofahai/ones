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
    
    public function index() {
        $data = parent::index(true);
        
        $dataModel = D("DataModelDataView");
        $data = $dataModel->assignModelData($data, false);
        
        
        $this->response($data);
    }
    
    public function insert() {
        
        print_r($_POST);
        exit;
        
    }
    
}
