<?php

/**
 * @filename StockinModel.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-11-13  14:18:25
 * @Description
 * 
 */
class StockinModel extends CommonModel {
    
    protected $_auto = array(
        array("status", 0),
        array("user_id", "getCurrentUid", 1, "function")
    );
    
    protected $workflowAlias = "stockin";

    public $relationModels = array(
        "Purchase","Returns", "Produce"
    );
    
    /**
     * 创建新单据
     */
    public function newBill($billData, $billItems) {

        if(!$billItems) {
            $this->error = "params_error";
            return false;
        }

        /*
         * 预检测factory_code_all
         * **/
        if(!$this->checkFactoryCodeAll($billItems)) {
            $this->error = "factory_code_not_full";
            return false;
        }

        $this->startTrans();
        
        $billData["bill_id"] = makeBillCode("RK");

        $billId = $this->add($billData);
        if(!$billId) {
            $this->rollback();
            $this->error = "insert_error";
            return false;
        }
        $itemsModel = D("StockinDetail");
        foreach($billItems as $billItem) {
            $billItem["stockin_id"] = $billId;
            $id = $itemsModel->add($billItem);
            if(!$id) {
                $this->rollback();
                return false;
            }
        }
        
        $this->commit();
        
        //单据进入初始工作流程
        import("@.Workflow.Workflow");
        $workflow = new Workflow($this->workflowAlias);
        $node = $workflow->doNext($billId, "", true);
        return $billId;
        
    }
    
    public function editBill($bill, $rows) {
        $detailModel = D("StockinDetail");

        $this->startTrans();
        
        unset($bill["dateline"]);
        unset($bill["status"]);
        unset($bill["bill_id"]);
        unset($bill["user_id"]);
        unset($bill["source_model"]);
        unset($bill["source_id"]);

        if(false === $this->save($bill)) {
            $this->rollback();
            return false;
        }

        $map = array(
            "stockin_id"=>$bill["id"]
        );
        $this->removeDeletedRows($rows, $map, $detailModel);

        foreach($rows as $row) {
            if(!$row["id"]) {
                $row["stockin_id"] = $bill["id"];
                $rs = $detailModel->add($row);
                if(false === $rs) {
                    $this->rollback();
                    return false;
                }
            } else {
                $rs = $detailModel->save($row);

                if(false === $rs) {
                    $this->rollback();
                    return false;
                }
            }

        }
        
        $this->commit();
        return true;
    }
    
    /**
     * 格式化POST或者PUT的数据
     * @params $postData 提交的数据
     * @params $forceInsert 强制定义为插入，而非修改（billItem是否包含ID）
     */
    public function formatData($postData, $forceInsert=false) {
        $stockinModel = $this;
        
        $billData = array(
            "bill_id" => makeBillCode(C("BILL_PREFIX.Stockin")),
            "subject" => $postData["subject"],
            "dateline"=> $postData["dateline"] ? strtotime($postData["dateline"]) : CTS,
            "status"  => 0,
            "user_id" => getCurrentUid(),
            "stock_manager" => 0,
            "total_num"=> 0,
            "memo"    => $postData["memo"],
            "type_id" => $postData["type_id"]
        );

        if($postData["source_model"]) {
            $billData["source_model"] = $postData["source_model"];
            $billData["source_id"] = $postData["source_id"];
        }
        
        $id = abs(intval($_GET["id"]));
        if($id) {
            $billData["id"] = $id;
        }
        
        $data = $postData["rows"];
        $billItems = array();
        foreach($data as $k=> $billItem) {
            if(!$billItem) {
                continue;
            }
            list($factory_code, $goodsId, $catid) = explode("_", $billItem["goods_id"]);
            $billItems[$k] = array(
                "goods_id"   => $goodsId,
                "num"        => $billItem["num"],
                "factory_code_all" => makeFactoryCode($billItem, $factory_code),
                "memo" => $billItem["memo"],
                "stock_id"   => $billItem["stock"]//$billItem["stock_id"]
            );
            $billData["total_num"] += $billItem["num"];
            if(!$forceInsert and $billItem["id"]) {
                $billItems[$k]["id"] = $billItem["id"];
            }
        }
        
        return array(
            $billData,
            reIndex($billItems)
        );
    }
    
    
}
