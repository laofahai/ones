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

    protected $dataModelAlias = "product";
    
    protected $exportFields = array(
        "factory_code_all" => "原厂编码",
        "category_name" => "分类名称",
        "goods_name" => "品名",
        "measure" => "计量单位",
        "stock_name" => "仓库",
        "num" => "库存数量",
        "store_min" => "库存下限",
        "store_max" => "库存上限"
    );
    
    public function read() {

        if(is_numeric($_GET["id"]) && intval($_GET["id"]) === 0) {
            $map = array();
            $this->_filter($map);

            list($factoryCode, ) = explode("_", $_GET["goods_id"]);
            $fca = makeFactoryCode($_GET, $factoryCode);

            $map["factory_code_all"] = $fca;

//            print_r($fca);exit;

            $model = D("StockProductList");
            $data = $model->where($map)->find();
//            echo $model->getLastSql();exit;
//            print_r($map);exit;
            $this->response(array(
                "num" => $data["num"]
            ));
        } else {
            return parent::read();
        }


    }
    
    protected function _filter(&$map) {
        if($_GET["stock_id"]) {
            unset($map["id"]);
            $map["stock_id"] = abs(intval($_GET["stock_id"]));
        }
        if($_GET["factory_code_all"]) {
            $map["factory_code_all"] = $_GET["factory_code_all"];
        }
    }


    public function export() {
        $params = json_decode(base64_decode($_GET["params"]), true);

        $model = D("StockProductListView");
        $map = array();
        if($_GET["stock"]) {
            $map["stock_id"] = array("IN", implode(",", $params["stock"]));
        }
        if($params["warningonly"] > 0) {
            $map["_string"] = '((store_min>0 AND store_min>=num) OR (store_max>0 AND store_max<=num))';
        }
        if($_GET["category"]) {
            $map["goods_category_id"] = array("IN", implode(",", $params["category"]));
        }
        
        $data = $model->where($map)->order("stock_id ASC")->select();
//        echo $model->getLastSql();
//        print_r($data);exit;
//        
        $this->doExport(sprintf("export_kcqd_%s", date("YmdHis", CTS)), $data);
    }
    
}
