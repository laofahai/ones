<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of StockWarningAction
 *
 * @author nemo
 */
class StockWarningAction extends CommonAction {
    
    public function index() {
        $model = D("StockProductListView");
        $map = array(
            "_string" => "(store_min>0 and num<=store_min) or (store_max>0 and num>=store_max)"
        );
        $data = $model->where($map)->select();
//        print_r($data);
        $this->response($data);
    }
    
}
