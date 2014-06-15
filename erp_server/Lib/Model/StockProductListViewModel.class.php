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
        "Goods" => array("name"=>"goods_name","measure","goods_category_id","store_min","store_max", "_on"=>"Goods.id=StockProductList.goods_id"),
        "GoodsCategory" => array("name"=>"category_name","bind_model"=>"bind_model_id", "_on"=>"Goods.goods_category_id=GoodsCategory.id"),
        "Stock" => array("name"=>"stock_name", "_on"=>"Stock.id=StockProductList.stock_id"),
    );
    
    // 定义原厂编码格式
    protected $goodsCode = "factory_code-standard-version";
    
    /**
     * @override
     * 
     * factory_code_all : 商品编码+规格ID+型号ID
     */
    public function select($options=array()) {
        $data = parent::select($options);
//        echo $this->getLastSql();exit;
//        print_r($data);exit;
        
        foreach($data as $k=>$v) {
            $data[$k]["modelIndex"] = sprintf("%d-%d", $v["goods_category_id"], $v["bind_model"]);
            $modelIds[$v["bind_model_id"]] = $v["bind_model_id"];
            $data[$k]["goodsCode"] = explode("-", $v["factory_code_all"]);
//            $data[$k]["num"] = intval($data[$k]["num"]);
        }
        
        $dmd = D("DataModelDataView");
        $map = array(
            "model_id" => array("IN", implode(',', $modelIds))
        );
        $tmp = $dmd->where($map)->select();
        
        foreach($tmp as $k=>$v) {
            $dataView[$v["id"]] = $v; 
        }
        
        foreach($data as $k=>$v) {
            foreach($v["goodsCode"] as $i=> $gc) {
                if($i==0) {
                    continue;
                }
                $data[$k][$dataView[$gc]["field_name"]] = $dataView[$gc]["data"];
            }
        }
        
//        print_r($data);exit;
        return $data;
        
        
    }
    
}

?>
