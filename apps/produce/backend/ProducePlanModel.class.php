<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of ProducePlanModel
 *
 * @author nemo
 */
class ProducePlanModel extends CommonModel {
    
    public $workflowAlias = "producePlan";

    protected $readonlyField = array("create_time");

    /*
     * status: 0 新单据
     *         1 已生成BOM
     *         2 BOM已保存
     *         3 已开始生产
     *         4 生产结束
     * **/
    public function newPlan($data) {
        $rows = $data["rows"];
        unset($data["rows"]);
        
        $this->startTrans();
        
        $id = $this->add($data);
        
        if(!$id) {
            Log::write("SQL Error:".$this->getLastSql(), Log::SQL);
            $this->rollback();
            return false;
        }
        
        $detailModel = D("ProducePlanDetail");
        foreach($rows as $row) {
            $row["plan_id"] = $id;
            $rs = $detailModel->add($row);
            if(!$rs) {
                Log::write("SQL Error:".$this->getLastSql(), Log::SQL);
                $this->rollback();
                return false;
            }
        }
        
        $this->commit();

        $workflow = new Workflow($this->workflowAlias);
        $workflow->doNext($id, "", true);
        
        return $id;
    }

    public function newBill($data) {
        return $this->newPlan($data);
    }

    public function editPlan($data) {
        $rows = $data["rows"];
        unset($data["rows"]);

        $this->startTrans();

        if(false === $this->save($data)) {
            Log::write("SQL Error:".$this->getLastSql(), Log::SQL);
            $this->rollback();
            return false;
        }

        $detailModel = D("ProducePlanDetail");
        $map = array(
            "plan_id" => $data["id"]
        );
        $this->removeDeletedRows($rows, $map, $detailModel);

        foreach($rows as $row) {
            $row["plan_id"] = $data["id"];
            $method = $row["id"] ? "save" : "add";
            if(false === $detailModel->$method($row)) {
                Log::write("SQL Error:".$detailModel->getLastSql(), Log::SQL);
                $this->rollback();
                return false;
            }
//            echo $detailModel->getLastSql();
        }

        $this->commit();

        return $data["id"];

    }

    public function formatData($postData) {
        $data = array(
            "start_time"=> strtotime($postData["start_time"]),
            "end_time"  => strtotime($postData["end_time"]),
            "type" => $postData["type"],
            "memo" => $postData["memo"],
            "total_num" => $postData["total_num"],
            "create_time"=> CTS,
            "source_model" => $postData["source_model"],
            "source_id" => $postData["source_id"],
        );

        if($_POST["id"]) {
            $data["id"] = $_POST["id"];
        }

        $rows = array();
        $needed = array(
            "goods_id", "num"
        );

        foreach($postData["rows"] as $row) {
            $tmp = array();
            if(!checkParamsFull($row, $needed)) {
                continue;
            }
            list($factoryCode, $goods_id, $catid) = explode("_", $row["goods_id"]);
            $tmp["goods_id"] = $row["goods_id"] = $goods_id;
            $tmp["factory_code_all"] = makeFactoryCode($row, $factoryCode);
            $tmp["num"] = $row["num"];
            $tmp["start_time"] = $data["start_time"];
            $tmp["status"] = 0;
            $tmp["memo"] = $row["memo"];
            $tmp["create_time"] = CTS;
            $rows[] = $tmp;
        }

        if(!$rows) {
            $this->error = "fillTheForm";
            return false;
        }

        $data["rows"] = $rows;
        return $data;
    }

    public function toRelatedItem($sourceModel, $sourceId) {
        $map = array(
            "source_model" => $sourceModel,
            "source_id"    => $sourceId
        );
        return $this->field(
            "id,id AS 'bill_id','ProducePlan' AS type,'retweet' AS icon,'produce/editBill/producePlan/id/' AS link"
        )->where($map)->order("id ASC")->select();
    }

    public function getRelatedItem($sourceModel, $sourceId) {
        return $this->field(
            "id,id AS 'bill_id','ProducePlan' AS type,'retweet' AS icon,'produce/editBill/producePlan/id/' AS link"
        )->find($sourceId);
    }

}
