<?php

/**
 * @filename ConfirmStockin.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-11-17  9:14:38
 * @Description
 * 
 */
class StockinConfirmStockin extends WorkflowAbstract {
    
    /**
     * @todo 更新仓库总量
     */
    public function run() {

        //判定是否已完全入库
        $stockin = D("Stockin");
        $theStockin = $stockin->find($this->mainrowId);

        if(!$_REQUEST["donext"]) {
            if($theStockin["ined_num"] >= $theStockin["total_num"]) {
                $data = array(
                    "type" => "message",
                    "error"=> "true",
                    "msg"  => "all_have_ined_stock"
                );
            } else {
                $data = array(
                    "type" => "redirect",
                    "location" => sprintf("/doWorkflow/Stockin/confirm/%d/%d", $this->currentNode["id"], $this->mainrowId)
                );
            }

            $this->response($data);
        }

        $data = $_POST["data"];
        $dm = D("StockinDetail");
        $storeProduct = D("StockProductList");

        $stockin->startTrans();

        $totalIned = 0;

        $dataModel = D("DataModel")->getByAlias("product");
        $tmp = D("DataModelFields")->where(array(
            "model_id" => $dataModel["id"],
            "deleted"  => 0
        ))->select();
        $dataModelFields = array();

        foreach($tmp as $field) {
            $dataModelFields[] = $field["field_name"];
        }

        $logs = array();
        $storeInfo = array();
        $goodsIds = array();

        foreach($data["rows"] as $k=>$v) {
            list(,$goods_id,) = explode("_", $v['goods_id']);
            $data["rows"][$k]["goods_id"] = $goods_id;
            $goodsIds[] = $goods_id;
        }

        $goodsModel = D("Goods");
        $tmp = $goodsModel->field("id,store_min,store_max")->where(array(
            "id" => array("IN", $goodsIds)
        ))->select();
        foreach($tmp as $s) {
            $storeW[$s["id"]] = $s;
        }

        $stockLog = D("StockLog");

        foreach($data["rows"] as $v) {

            if(!$v or !$v["id"]) {

                continue;
            }

            //未选择入库仓库
            if(!$v["stock"]) {
                $stockin->rollback();
                $this->error("select_stock");
                return "error";
            }

            if(strpos($v["goods_id"], "_") !== false) {
                list($fc, $v["goods_id"], $catid) = explode("_", $v["goods_id"]);
            }

            //本次入库总数量
            $totalIned += $v["num"];

            //更新本行入库数量
            $dm->where("id=".$v["id"])->setInc("ined", $v["num"]);

            //入库日志(工作流MEMO)
            //dataModel
            $modelData = "";
            foreach($dataModelFields as $f) {
                $modelData.="/".$v[$f."_label"];
            }
            $tmp = sprintf("%s%s: %s (%s)", $v["goods_name"], $modelData, $v["num"], $v["stock_label"]);
            array_push($logs, $tmp);

            $storeInfo[] = array(
                "factory_code_all" => $v["factory_code_all"],
                "stock_id" => $v["stock"],
                "num" => $v["num"],
                "goods_id" => $v["goods_id"],
                "store_min" => $storeW[$v["goods_id"]]["store_min"],
                "store_max" => $storeW[$v["goods_id"]]["store_max"]
            );

            //记录库存操作日志
            $stockLog->record(array(
                "factory_code_all" => $v["factory_code_all"],
                "repository_id" => $v["stock"],
                "num" => $v["num"],
                "source_id" => $this->mainrowId,
                "dateline" => CTS,
                "type" => 1,
                "memo" => $v["memo"],
                "goods_id" => $v["goods_id"]
            ));

        }


        //增加库存
        if(!$storeProduct->updateStoreList($storeInfo)) {}

        //更新入库单信息
        $theStockin = $stockin->find($this->mainrowId);
        if($theStockin["status"] == 1) {
            $stockin->where("id=".$this->mainrowId)->setInc("ined_num", $totalIned);

        } else {
            //第一次入库
            $stockin->where("id=".$this->mainrowId)->save(array(
                "memo"   => $data["memo"],
                "status" => 1,
                "ined_num"   => $totalIned,
                "stock_manager" => getCurrentUid()
            ));
        }

        //本次出库日志
        $this->context['memo'] = implode("\n", $logs);


        $stockin->commit();
    }
    
    public function checkStockManger($condition) {
        return true;
        $stockIn = D("Stockin")->find($this->mainrowId);
        $managers = D("Stock")->where("id=".$stockIn["stock_id"])->getField("managers");
        
        return inExplodeArray(getCurrentUid(), $managers);
    }
    
}

?>
