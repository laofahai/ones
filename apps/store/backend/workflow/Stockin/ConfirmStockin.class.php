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
        //显示确认页面
        if(!$_POST["donext"]) {
            $data = array(
                "type" => "redirect",
                "location" => sprintf("/doWorkflow/Stockin/confirm/%d/%d", $this->currentNode["id"], $this->mainrowId)
            );
            $this->response($data);
        }

        $id = $this->mainrowId;
        if(!$id) {
            $this->error("params_error");
        }
        
        $map = array(
            "stockin_id" => $id
        );

        //更新POST到得数据至入库单
        $data = $_POST["data"];
        $stockinModel = D("Stockin");
        $stockinModel->where("id=".$this->mainrowId)->save(array(
            "total_num" => $data["total_num"],
            "memo" => $data["memo"]
        ));
        $stockinDetailModel = D("StockinDetail");
//        print_r($data["rows"]);exit;
        foreach($data["rows"] as $row) {
            if(!$row["stock"]) {
                $this->error("fillTheForm");
                break;
            }
            if($row["id"]) {
                $stockinDetailModel->where("id=".$row["id"])->save(array(
                    "stock_id" => $row["stock"],
                    "memo" => $row["memo"]
                ));
            } else {
                list($fc,$goodsId,$catid) = explode("_", $row["goods_id"]);
                $row["goods_id"] = $goodsId;
                $stockinDetailModel->add(array(
                    "stockin_id" => $this->mainrowId,
                    "goods_id" => $goodsId,
                    "num" => $row["num"],
                    "factory_code_all" => makeFactoryCode($row, $fc),
                    "stock_id" => $row["stock"],
                    "memo" => $row["memo"]
                ));
            }
        }

        $theDetails = $stockinDetailModel->where($map)->select();

        $theStockin = $stockinModel->find($id);
        $stockProductListModel = D("StockProductList");
        $stockProductListModel->startTrans();
        $rs = $stockProductListModel->updateStoreList($theDetails);
        if(true === $rs) {
            $stockProductListModel->commit();
            $data = array(
                "status" => 2,
                "stock_manager" => getCurrentUid()
            );
            $stockinModel->where("id=".$id)->save($data);
//            $this->updateStatus("Stockin", $id, 2);
        } else {
//            print_r($theDetails);
            Log::write("SQL Error:".$stockProductListModel->getLastSql(), Log::SQL);
            $stockProductListModel->rollback();
            $this->error("operate_failed");
//            $this->action->error(L("operate_failed"));
        }
        //若外部生成，走外部下一流程
        if($theStockin["source_model"]) {
            import("@.Workflow.Workflow");
            $workflow = new Workflow(strtolower($theStockin["source_model"]), $this->action);
            $node = $workflow->doNext($theStockin["source_id"], "", true, true);
        }
    }
    
    public function checkStockManger($condition) {
        return true;
        $stockIn = D("Stockin")->find($this->mainrowId);
        $managers = D("Stock")->where("id=".$stockIn["stock_id"])->getField("managers");
        
        return inExplodeArray(getCurrentUid(), $managers);
    }
    
}

?>
