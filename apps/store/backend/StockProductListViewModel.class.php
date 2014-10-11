<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of StockProductListViewModel
 *
 * @author 志鹏
 */
class StockProductListViewModel extends ViewModel {

    protected $viewFields = array(
        "StockProductList" => array("*", "_type"=>"left"),
        "Goods" => array("name"=>"goods_name","measure","goods_category_id","_on"=>"Goods.id=StockProductList.goods_id"),
        "GoodsCategory" => array("name"=>"category_name", "_on"=>"Goods.goods_category_id=GoodsCategory.id"),
        "Stock" => array("name"=>"stock_name", "_on"=>"Stock.id=StockProductList.stock_id"),
    );


    public $searchFields = array(
        "Goods.name", "factory_code_all", "GoodsCategory.name", "Stock.name", "Goods.pinyin"
    );

    public $orderFields = array(
        "factory_code_all"
    );

    /**
     * @override
     *
     */
    public function select($options=array()) {
        $data = parent::select($options);
//        echo $this->getLastSql();exit;
//        print_r($data);exit;

        $theDataModel = D("DataModel")->getByAlias("product");

        foreach($data as $k=>$v) {
            $data[$k]["modelIndex"] = sprintf("%d-%d", $v["goods_category_id"], $theDataModel["id"]);
            $data[$k]["goodsCode"] = explode(DBC("goods.unique.separator"), $v["factory_code_all"]);
        }

        $params = array(
            $data, null, false, true
        );
        tag("assign_dataModel_data", $params);


        $data = $params[0];
        return $data;
        
        
    }
    
}

?>
