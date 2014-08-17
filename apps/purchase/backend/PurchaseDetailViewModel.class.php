<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of PurchaseDetailViewModel
 *
 * @author 志鹏
 */
class PurchaseDetailViewModel extends CommonViewModel {
    
    protected $viewFields = array(
        "PurchaseDetail" => array("*", "_type"=>"left"),
        "Purchase" => array("bill_id", "_on"=>"Purchase.id=PurchaseDetail.purchase_id", "_type"=>"left"),
        "Goods"  => array("name"=>"goods_name", "pinyin"=>"goods_pinyin", "measure","factory_code", "price", "goods_category_id", "_on" => "Goods.id=PurchaseDetail.goods_id", "_type"=>"left"),
    );
    
    
}

?>
