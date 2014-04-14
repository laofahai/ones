<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of StockoutDetailViewModel
 *
 * @author nemo
 */
class StockoutDetailViewModel extends CommonViewModel {
    
    protected $viewFields = array(
        "StockoutDetail" => array("id","stockout_id", "factory_code_all","goods_id","stock_id","num"),
        "Goods" => array("name"=>"goods_name", "goods_category_id", "_on"=>"Goods.id=StockoutDetail.goods_id"),
//        "StockProductList" => array("num"=>"store_num")
    );
    
}
