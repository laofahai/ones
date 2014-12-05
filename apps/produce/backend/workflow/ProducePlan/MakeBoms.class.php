<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of MakeBoms
 * 
 * 根据成品生成所需物料清单
 *
 * @author nemo
 */
class ProducePlanMakeBoms extends WorkflowAbstract {
    
    private $returnData = array();
    
    public function run() {
        $planModel = D("ProducePlan");
        $detailModel = D("ProducePlanDetail");
        $tplModel = D("ProductTpl");
        $tplDetailModel = D("ProductTplDetail");
        $bomModel = D("ProduceBoms");
        
        //执行下一步
        if($_REQUEST["donext"]) {

            //@todo 数据完整性检查
            //清除当前的数据
            $bomModel->startTrans();
            $bomModel->where(array(
                "plan_id" => $_POST["id"] // 计划ID
            ))->delete();
            //重新写入
            foreach($_POST["data"]["rows"] as $row) {
                list($factoryCode,$goodsId, $catId) = explode("_", $row["goods_id"]);
                if(!$goodsId) {
                    continue;
                }
                $row["goods_id"] = $goodsId;
                $data = array(
                    "plan_id" => $_POST["id"],
                    "plan_detail_id" => $row["plan_detail_id"] ? $row["plan_detail_id"] : 0,
                    "factory_code_all" => $row["factory_code_all"] ? $row["factory_code_all"] : makeFactoryCode($row, $factoryCode),
                    "num" => intval($row["num"]),
                    "goods_id" => $goodsId
                );
                if(!$bomModel->add($data)) {
                    Log::write($bomModel->getLastSql(), Log::SQL);
                    $bomModel->rollback();
                    $this->error("params_error");return;
                }
            }
            //status 标识BOM单已保存
            $planModel->where("id=".$this->mainrowId)->save(array(
                "status" => 2
            ));
            $bomModel->commit();
            
            return true;
        }
        
        $this->returnData = array(
            "type" => "redirect",
            "location" => sprintf("/doWorkflow/Produce/makeBoms/%d/%d", $this->currentNode["id"], $this->mainrowId)
        );
        
        $thePlan = $planModel->find($this->mainrowId);
        if($thePlan["status"] == 1) {
            $this->response($this->returnData);
            return;
        }
        
        $details = $detailModel->where("plan_id=".$this->mainrowId)->select();

        if(!$details) {
            return false;
        }
        
        /**
         * 生产计划详情
         */
        foreach($details as $row) {
            $fcas[$row["factory_code_all"]] = $row["factory_code_all"];
            $products[$row["factory_code_all"]] = $row;
        }
        
        $tpls = $tplModel->where(array(
            "factory_code_all" => array("IN", sprintf("%s", implode(",", $fcas)))
        ))->select();

        if(!$tpls) {
            $this->response($this->returnData);
        }
        foreach($tpls as $tp) {
            $tplids[] = $tp["id"];
            $theTpls[$tp["id"]] = $tp;
        }
        
        $boms = $tplDetailModel->where(array(
            "tpl_id" => array("IN", implode(",", $tplids))
        ))->select();
        
//        echo $tplDetailModel->getLastSql();exit;
        
        /**
         * 清单所有需用物料
         * 数组索引为成品原厂编码
         */
        foreach($boms as $k=>$bom) {
            $theBoms[$theTpls[$bom["tpl_id"]]["factory_code_all"]][] = $bom;
        }


        /**
         * @ $k => 原厂编码
         * 所需物料数量 = 预定义物料数量 * 所需成品数量
         */
        $resultBoms = array();
        foreach($products as $k=>$v) {
            foreach($theBoms[$k] as $bom) {
                $bom["num"] *= $v["num"];
                if(array_key_exists($bom["factory_code_all"], $resultBoms)) {
                    $resultBoms[$bom["factory_code_all"]]["num"] += $bom["num"];
                } else {
                    $resultBoms[$bom["factory_code_all"]] = array(
                        "plan_id" => $this->mainrowId,
                        "plan_detail_id" => $v["id"],
                        "goods_id" => $bom["goods_id"],
                        "num" => $bom["num"],
                        "factory_code_all" => $bom["factory_code_all"]
                    );
                }
                $products[$k]["boms"][] = $bom;
            }
        }
        
        
        $bomModel->startTrans();
        
        foreach($resultBoms as $bom) {
            if(!$bomModel->add($bom)) {
                Log::write($bomModel->getLastSql(), Log::SQL);
                $bomModel->rollback();
            }
        }
        
        //status 标识已生成BOM单
        $planModel->where("id=".$this->mainrowId)->save(array(
            "status" => 1
        ));
        
        $bomModel->commit();
        
        
        $this->response($this->returnData);
        
        // 生产计划完成后，清除BOM表
    }
    
}
