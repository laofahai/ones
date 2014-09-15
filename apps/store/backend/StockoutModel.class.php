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

    public $relationModels = array("Orders", "ProducePlan");

    /**
     * 创建出库单
     */
    public function makeStockoutPaper($sourceModelName, $sourceId, $sourceUidField="saler_id", $sourceDetailForeignKey="", $sourceStockIdFeild="stock_id") {
        $sourceDetailForeignKey = $sourceDetailForeignKey ? $sourceDetailForeignKey : strtolower($sourceModelName)."_id";
        $sourceModel = D($sourceModelName);
        $source = $sourceModel->find($sourceId);
        
        if(!$source) {
            return false;
        }
        $data = array(
            "bill_id"   => makeBillCode("CK"),
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
                "stockout_id" => $stockoutId,
                "num" => $d["num"]
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

    public function formatData($postData) {
        if(!$postData["id"]) {
            $data["bill_id"] = makeBillCode("CK");
            $data["source_id"] = "";
            $data["source_model"] = "";
            $data["dateline"] = strtotime($postData['dateline']);
            $data["stock_manager"] = getCurrentUid();
            $data["status"] = 0;
        } else {
            $data["id"] = $postData["id"];
        }

        $data["total_num"] = $postData["total_num"];
        $data["memo"] = $postData["memo"];

        $rows = array();

        $needed = array(
            "goods_id", "num"
        );
        foreach($postData["rows"] as $row) {
            list($fc,$goods_id) = explode("_", $row["goods_id"]);
            if(!checkParamsFull($row, $needed)) {
                continue;
            }
            $rows[] = array(
                "id" => $row["id"] ? $row["id"] : 0,
                "stockout_id" => $row["stockout_id"],
                "factory_code_all" => makeFactoryCode($row, $fc),
                "goods_id" => $goods_id,
                "stock_id" => $row["stock"],
                "num" => $row["num"],
                "outed" => $row["outed"] ? $row["outed"] :0,
                "memo" => $row["memo"]
            );
        }

        $data["rows"] = $rows;
        return $data;

    }

    public function newBill($data) {
        $data = $this->formatData($data);

        $rows = $data["rows"];

        if(!$rows) {
            return false;
        }
        unset($data["rows"]);

        if(!$this->checkFactoryCodeAll($rows)) {
            $this->error = "factory_code_not_full";
            return false;
        }

        $this->startTrans();

        $stockOutId = $this->add($data);

        if(!$stockOutId) {
            $this->rollback();
            Log::write($this->getLastSql(), Log::SQL);
            return false;
        }

        $detailModel = D("StockoutDetail");
        foreach($rows as $row) {
            $row["stockout_id"] = $stockOutId;
            if(!$detailModel->add($row)) {
                $this->rollback();
                Log::write($this->getLastSql(), Log::SQL);
                return false;
            }
        }

        $this->commit();

        import("@.Workflow.Workflow");
        $workflow = new Workflow($this->workflowAlias);
        $node = $workflow->doNext($stockOutId, "", true);
        return $stockOutId;

    }

    public function editBill($data) {
        $bill = $this->formatData($data);
//        print_r($bill);exit;
        $rows = $bill["rows"];
        unset($bill["rows"]);

        /*
         * 预检测factory_code_all
         * **/
        if(!$this->checkFactoryCodeAll($rows)) {
            $this->error = "factory_code_not_full";
            return false;
        }

//        print_r($rows);exit;

        $this->startTrans();
        $this->save($bill);

        $map = array(
            "stockout_id"=>$bill["id"]
        );
        $detailModel = D("StockoutDetail");
        $this->removeDeletedRows($rows, $map, $detailModel);

        foreach($rows as $row) {
            $method = $row["id"] ? "save" : "add";
            if($method == "add") {
                $row["stockout_id"] = $bill["id"];
            }
            if(false === $detailModel->$method($row)) {
                $this->rollback();
                Log::write($detailModel->getLastSql(), Log::SQL);
                return false;
            }
        }

        $this->commit();
        return $bill["id"];

    }
    
}

?>
