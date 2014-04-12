<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of StockProductListAction
 *
 * @author nemo
 */
class StockProductListAction extends CommonAction {
    
    protected $indexModel = "StockProductListView";
    
    protected $exportFields = array(
        "factory_code_all" => "原厂编码",
        "category_name" => "分类名称",
        "goods_name" => "品名",
        "measure" => "计量单位",
        "standard"=> "规格",
        "version" => "型号",
        "stock_name" => "仓库",
        "num" => "库存数量",
        "store_min" => "库存下限",
        "store_max" => "库存上限"
    );
    
    protected function _filter(&$map) {
        if($_GET["stock_id"]) {
            unset($map["id"]);
            $map["stock_id"] = abs(intval($_GET["stock_id"]));
        }
        if($_GET["factory_code_all"]) {
            $map["factory_code_all"] = $_GET["factory_code_all"];
        }
    }
    
    public function Export() {
        
        $model = D("StockProductListView");
        $map = array();
        if($_GET["stock"]) {
            $map["stock_id"] = array("IN", str_replace("_", ",", $_GET["stock"]));
        }
        if($_GET["warningonly"] > 0) {
            $map["_string"] = '((store_min>0 AND store_min>=num) OR (store_max>0 AND store_max<=num))';
        }
        if($_GET["category"]) {
            $map["goods_category_id"] = array("IN", str_replace("_", ",", $_GET["category"]));
        }
        
        $data = $model->where($map)->order("stock_id ASC")->select();
//        echo $model->getLastSql();
        print_r($data);exit;
//        
        $this->doExport(sprintf("export_kcqd_%s.xls", date("YmdHis", CTS)), $data);
    }
    
}
