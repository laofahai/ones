<?php

/**
 * @filename StockoutModel.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-11-17  17:15:22
 * @Description
 * 
 */
class StockoutModel extends CommonModel {
    
    protected $workflowAlias = "stockout";
    
    protected $_auto = array(
        array("status", 0),
        array("datelie", CTS),
        array("stock_manager", 0)
    );
    
    public function getStockoutBill($id) {
        $data = $this->find($id);
        $souceModel = D($data["source_model"]."View");
        $data["source"] = $souceModel->find($data["source_id"]);
        
        $detailModel = D("StockoutDetailView");
        $data["rows"] = $detailModel->where("stockout_id=".$data["id"])->select();
//        echo $detailModel->getLastSql();exit;
        
        /**
         * 每列信息处理
         */
        $modelIds = array();
        foreach($data["rows"] as $k=>$v) {
            $tmp = explode("-", $v["factory_code_all"]); //根据factory_code_all factory_code - standard - version
            $factory_code = array_shift($tmp);
            $modelIds = array_merge($modelIds, $tmp);
            $v["modelIds"] = $tmp;
            $v["stock"] = $v["stock_id"];
            $v["memo_label"] = $v["memo"];
            $v["stock_label"] = $v["stock_name"];
            $v["goods_id"] = sprintf("%s_%s_%s", $factory_code, $v["goods_id"], $v["goods_category_id"]); // factory_code, id, catid
            $v["goods_id_label"] = sprintf("%s",$v["goods_name"]);
            $v["num_label"] = $v["num"];
            $data["rows"][$k] = $v;
            $fca[] = $row["factory_code_all"];
        }
        
        $dataModel = D("DataModelDataView");
        $data["rows"] = $dataModel->assignModelData($data["rows"], $modelIds);
//        print_r($modelIds);
//        print_r($data["rows"]);exit;
        return $data;
    }
    
    /**
     * 创建出库单
     */
    public function makeStockoutPaper($sourceModelName, $sourceId, $sourceUidField="saler_id", $sourceDetailForeignKey="", $sourceStockIdFeild="stock_id") {
        $sourceDetailForeignKey = $sourceDetailForeignKey ? $sourceDetailForeignKey : strtolower($sourceModel)."_id";
        $sourceModel = D($sourceModelName);
        $source = $sourceModel->find($sourceId);
        
        if(!$source) {
            return false;
        }
        $data = array(
            "bill_id"   => uniqid("CK"),
            "source_id" => $sourceId,
            "source_model" => $sourceModelName,
//            "stock_id" => $source[$sourceStockIdFeild],
            "total_num"=> $source["total_num"],
            "subject"  => $source["subject"],
            "dateline" => CTS,
//            "source_user_id" => $source[$sourceUidField]
        );
        $this->startTrans();
   
        $stockoutId = $this->add($data);
//        echo $this->getLastSql();exit;             
        if(!$stockoutId) {
            $this->rollback();
            return false;
        }
        
//        echo $this->getLastSql();exit;
//        echo $stockoutId;exit;
        $stockoutDetail = D("StockoutDetail");
        $sourceDetail = D($sourceModelName."Detail");
        $details = $sourceDetail->where($sourceDetailForeignKey."=".$sourceId)->select();

        if(!$details) {
//            echo $sourceDetail->getLastSql();exit;
            $this->rollBack();
            return false;
        }
        foreach($details as $d) {
            $data = array(
                "goods_id" => $d["goods_id"],
                "factory_code_all" => $d["factory_code_all"],
                "stock_id" => 0,
                "stockout_id" => $stockoutId
            );
            $rs = $stockoutDetail->add($data);
            if(!$rs) {
                $this->rollBack();
                break;
            }
        }
        
        $this->commit();
        
        return $stockoutId;
    }
    
}

?>
