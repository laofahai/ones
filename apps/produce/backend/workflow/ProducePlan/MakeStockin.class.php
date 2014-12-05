<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 6/17/14
 * Time: 00:12
 */

class ProducePlanMakeStockin extends WorkflowAbstract {

    /*
     * 生成入库单，只取得已执行完所有工艺并且未生成入库单的产品
     * 当所有产品已入库之后返回错误
     * */
    public function run() {
        if(!$_POST["donext"]) {
            $this->response(array(
                "type"=> "redirect",
                "location"=> sprintf("/doWorkflow/Produce/makeStockin/%d/%d", $this->currentNode["id"], $this->mainrowId)
            ));
        }

        $data = $_POST["data"];

        if(!$data["rows"]) {
            exit;
        }

        $model = D("Stockin");
        foreach($data["rows"] as $row) {
            if($row["id"]) {
                //标识已入库的生产详情
                $detailIds[$row["id"]] = $row["id"];
            }
        }

        $type = getTypeIdByAlias("stockin", "produce");
        $type = $type ? $type : getTypeByAlias("stockin", "other");

        $data["subject"] = "";
        $data["source_model"] = "ProducePlan";
        $data["source_id"] = $this->mainrowId;
        $data["type_id"] = $type;
        unset($data["id"]);
        list($bill, $rows) = $model->formatData($data, true);
//        print_r($rows);
        $stockinId = $model->newBill($bill, $rows);
//        var_dump($stockinId);
        /*
         * 更新已入库计划详情status=2
         * 检查是否所有计划内容已入库，更新生产计划status
         * **/
        if($stockinId) {
            $detailModel = D("ProducePlanDetail");
            $detailModel->where(array(
                "id" => array("IN", implode(",", $detailIds))
            ))->save(array(
                "status" => 2
            ));
            $num = $detailModel->where(array(
                "plan_id" => $this->mainrowId,
                "status"  => array("LT", 2)
            ))->count("id");
            if($num <= 0) {
                D("ProducePlan")->where("id=".$this->mainrowId)->save(array(
                    "status" => 4
                ));
            } else {
                exit;
            }
//            echo $detailModel->getLastSql();exit;
        } else {
            exit;
        }
//        var_dump($stockinId);
//        exit;
    }

} 