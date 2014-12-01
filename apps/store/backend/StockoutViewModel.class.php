<?php

/**
 * @filename StockoutViewModel.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-12-1  11:27:41
 * @Description
 * 
 */
class StockoutViewModel extends CommonViewModel {
    
    protected $workflowAlias = "stockout";
    
    protected $viewFields = array(
        "Stockout" => array("*","stock_manager"=>"stock_manager_id","_type"=>"left"),
        "User" => array("truename"=>"stock_manager", "_on"=>"User.id=Stockout.stock_manager", "_type"=>"left")
    );

    public $searchFields = array(
        "bill_id", "source_model", "User.truename"
    );

    public $orderFields = array(
        "dateline", "bill_id"
    );
    
    public function getStockoutBillsByIds($ids) {
        foreach($ids as $id) {
            $rs = $this->getStockoutBill($id);
            if(!$rs) {
                continue;
            }
            $data[] = $rs;
        }
        return $data;
    }
    
    public function getStockoutBill($id) {
       
        $data = $this->find($id);

        if(!$data) {
            return false;
        }

        if($data["source_model"]) {
            $sourceModel = D($data["source_model"]."View");
            $data["source"] = $sourceModel->find($data["source_id"]);

            if($_GET["includeSourceRows"]) {
                $sourceDetailModel = D($data["source_model"]."Detail");

                $foreignKey = $sourceDetailModel->foreignKey ? $sourceDetailModel->foreignKey : lcfirst($data["source_model"])."_id";

                $map[$foreignKey] = $data["source_id"];

                $tmp = $sourceDetailModel->where($map)->select();
                foreach($tmp as $t) {
                    $data["source_detail"][$t["factory_code_all"]] = $t;
                }
            }

        }

        $detailModel = D("StockoutDetailView");
        $data["rows"] = $detailModel->where("stockout_id=".$data["id"])->select();
        /**
         * 每列信息处理
         */
        $modelIds = array();
        foreach($data["rows"] as $k=>$v) {
            $tmp = explode(DBC("goods.unique.separator"), $v["factory_code_all"]); //根据factory_code_all factory_code - standard - version
            $factory_code = array_shift($tmp);
            $modelIds = array_merge($modelIds, $tmp);
            $v["modelIds"] = $tmp;
            $v["stock"] = $v["stock_id"];
            $v["stock_label"] = $v["stock_name"];
            $v["goods_id"] = sprintf("%s_%s_%s", $factory_code, $v["goods_id"], $v["goods_category_id"]); // factory_code, id, catid
            $v["goods_id_label"] = sprintf("%s",$v["goods_name"]);
            $v["total_num"] = $v["num"];
            $v["num"] = $v["num"] - $v["outed"];
            $data["rows"][$k] = $v;
            $fca[] = $v["factory_code_all"];
        }


        $params = array(
            $data["rows"], $modelIds
        );
        tag("assign_dataModel_data", $params);

        $data["rows"] = reIndex($params[0]);
        
//
//        $dataModel = D("DataModelDataView");
//        $data["rows"] = $dataModel->assignModelData($data["rows"], $modelIds);
        return $data;
    }
    
}
