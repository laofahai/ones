<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of ProductTplDetailAction
 *
 * @author nemo
 */
class ProductTplDetailAction extends CommonAction {


    
    public function _filter(&$map) {
        if($_GET["tpl_id"]) {
            $map["tpl_id"] = abs(intval($_GET["tpl_id"]));
        }
        if($_GET["id"]) {
            $map["tpl_id"] = abs(intval($_GET["id"]));
        }
    }
    
    public function insert() {
        $pid = abs(intval($_GET["pid"]));
        $model = D("ProductTplDetail");
        foreach($_POST["rows"] as $row) {
            if(!$row) {
                continue;
            }
            if(strpos($row["goods_id"], "_") === false) { //编辑模式
                $goods_id = $row["goods_id"];
                $factory_code_all = $row["factory_code_all"];
                $stock_id = $row["stock_id"];
            } else {
                list($fc,$goods_id,$catid) = explode("_", $row["goods_id"]);
                $factory_code_all = makeFactoryCode($row, $fc);
                $stock_id = $row["stock"];
            }
            
            $data = array(
                "tpl_id" => $pid,
                "goods_id" => $goods_id,
                "factory_code_all" => $factory_code_all,
                "num" => $row["num"],
                "stock_id" => $stock_id,
                "memo" => $row["memo"]
            );
            if($row["id"]) {
                $data["id"] = $row["id"];
                $model->save($data);
//                echo $model->getLastSql();
            } else {
                $model->add($data);
            }
        }
//        print_r($_POST);exit;
    }
    
    /**
     * 删除已删除的条目
     */
    public function update() {
        foreach($_POST["rows"] as $row) {
            $ids[] = $row["id"];
        }
        if($ids) {
            $map = array(
                "tpl_id" => abs(intval($_GET["pid"])),
                "id" => array("NOT IN", implode(",", $ids))
            );
            D("ProductTplDetail")->where($map)->delete();
        }
        $this->insert();
    }
    
    public function read() {
        $pid = abs(intval($_GET["id"]));
        $model = D("ProductTpl");
        $data = $model->find($pid);
        
        $rowsModel = D("ProductTplDetailView");
        $rows = $rowsModel->where("ProductTplDetail.tpl_id=".$pid)->select();
        $modelIds = array();
        foreach($rows as $k=>$v) {
            $tmp = explode(DBC("goods.unique.separator"), $v["factory_code_all"]); //根据factory_code_all factory_code - standard - version
            $factory_code = array_shift($tmp);
            $rows[$k]["stock"] = $v["stock_id"];
//            $rows[$k]["goods_id"] = $v["factory_code_all"];
            $modelIds = array_merge($modelIds, $tmp);
            $rows[$k]["modelIds"] = $tmp;
        }
//        echo $rowsModel->getLastSql();
//        print_r($rows);
        $params = array(
            $rows, $modelIds
        );
        tag("assign_dataModel_data", $params);
        
        $data["rows"] = $params[0];
//        echo $rowsModel->getLastSql();exit;
//        print_r($data);exit;
        $this->response($data);
    }
    
}
