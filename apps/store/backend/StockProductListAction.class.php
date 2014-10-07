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
    protected $readModel = "StockProductListView";

    protected $dataModelAlias = "product";

    protected $exportFields = array(
        "factory_code_all",
        "category_name",
        "goods_name",
        "measure",
        "stock_name",
        "num",
        "store_min",
        "store_max"
    );

    public function index() {
        $data = parent::index(true);

        foreach($data[1] as $k=>$v) {
            if($v["store_min"] > 0 && $v["num"] <= $v["store_min"]) {
                $data[1][$k]["colorize"] = "red";
            } else if($v["store_max"] > 0 && $v["num"] >= $v["store_max"]) {
                $data[1][$k]["colorize"] = "green";
            }
        }

//        print_r($data);exit;

        $this->response($data);
    }
    
    public function read() {

        if(is_numeric($_GET["id"]) && intval($_GET["id"]) === 0) {
            $map = array();
            $this->_filter($map);

            list($factoryCode, ) = explode("_", $_GET["goods_id"]);
            $fca = makeFactoryCode($_GET, $factoryCode);

            $map["factory_code_all"] = $fca;

            if(!$_GET["stock_id"]) {
                return;
            }

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

        $configedFields = DBC("store.stockProductList.exportFields");
        if($configedFields) {
            $this->exportFields = explode(",", $configedFields);
        } else {
            $params = array(
                "fields" => $this->exportFields,
                "dataModelAlias"=> "product"
            );

            tag("bind_dataModel_structure", $params);

            $this->exportFields = $params["fields"];
        }


        $this->doExport(sprintf("export_kcqd_%s", date("YmdHis", CTS)), $data);
    }
    
}
