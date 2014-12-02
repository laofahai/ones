<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of ConfirmStockout
 *
 * @author 志鹏
 */
class StockoutConfirmStockout extends WorkflowAbstract {
    
    /**
     * 1、修改库存数量  判断库存数量
     * 2、修改出库单状态
     * 3、判断是否已完全出库
     *
     * 在显示确认出库页面时获取的数据已经减去了已出库的数量
     * 所以仅需按照提交的表单进行处理即可。
     *
     * 三种情况：足额出库
     *          超额出库
     *          未完全出库
     */
    public function run() {

        //判定是否已完全出库
        $stockout = D("Stockout");
        $theStockout = $stockout->find($this->mainrowId);

        if(!$_REQUEST["donext"]) {
            if($theStockout["outed_num"] >= $theStockout["total_num"]) {
                $data = array(
                    "type" => "message",
                    "error"=> "true",
                    "msg"  => "all_have_outed_stock"
                );
            } else {
                $data = array(
                    "type" => "redirect",
                    "location" => sprintf("/doWorkflow/Stockout/confirm/%d/%d", $this->currentNode["id"], $this->mainrowId)
                );
            }

            $this->response($data);
        }

        $data = $_POST["data"];

        $dm = D("StockoutDetail");

        $stockout->startTrans();

        $totalOuted = 0;
        $storeProduct = D("StockProductList");

        $dataModel = D("DataModel")->getByAlias("product");
        $tmp = D("DataModelFields")->where("model_id=".$dataModel["id"])->select();
        $dataModelFields = array();

        foreach($tmp as $field) {
            $dataModelFields[] = $field["field_name"];
        }

        $stockLog = D("StockLog");

        $logs = array();
        foreach($data["rows"] as $k=>$v) {
            if(!$v or !$v["id"]) {
                continue;
            }

            //未选择出库仓库
            if(!$v["stock"]) {
                $stockout->rollback();
                $this->error("select_stock");
                return "error";
            }

            if(strpos($v["goods_id"], "_") !== false) {
                list($fc, $v["goods_id"], $catid) = explode("_", $v["goods_id"]);
            }

            //本次出库总数量
            $totalOuted += $v["num"];

            //更新本行出库数量
            $dm->where("id=".$v["id"])->setInc("outed", $v["num"]);

            //出库日志(工作流MEMO)
            //dataModel
            $modelData = "";
            foreach($dataModelFields as $f) {
                $modelData.="/".$v[$f."_label"];
            }
            $tmp = sprintf("%s%s: %s (%s)", $v["goods_name"], $modelData, $v["num"], $v["stock_label"]);
            array_push($logs, $tmp);

            //减少库存
            $storeProduct->where(array(
                "factory_code_all" => $v["factory_code_all"],
                "stock_id" => $v["stock"]
            ))->setDec("num", $v["num"]);

            //记录库存操作日志
            $stockLog->record(array(
                "factory_code_all" => $v["factory_code_all"],
                "repository_id" => $v["stock"],
                "num" => $v["num"],
                "source_id" => $this->mainrowId,
                "source_row_id" => $v["id"],
                "dateline" => CTS,
                "type" => 2,
                "memo" => $v["memo"],
                "goods_id" => $v["goods_id"]
            ));
        }

        //不允许负数库存存在, 库存自动清零
        //@todo 判断库存数量
        if(!DBC("allow_negative_store")) {
            $storeProduct->where("num<0")->save(array(
                "num" => 0
            ));
        }


        //更新出库单信息
        $theStockout = $stockout->find($this->mainrowId);
        if($theStockout["status"] == 1) {
            $stockout->where("id=".$this->mainrowId)->setInc("outed_num", $totalOuted);
        } else {
            //第一次出库
            $stockout->where("id=".$this->mainrowId)->save(array(
                "memo"   => $data["memo"],
                "status" => 1,
                "outtime" => CTS,
                "outed_num"   => $totalOuted,
                "stock_manager" => getCurrentUid()
            ));
        }

        //本次出库日志
        $this->context['memo'] = implode("\n", $logs);


        $stockout->commit();
    }
    
}

?>
