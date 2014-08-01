<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of GoodsCraftAction
 *
 * @author nemo
 */
class GoodsCraftAction extends CommonAction {
    
    public function index() {

        $goods_id = abs(intval($_GET["goods_id"]));

        $craftModel = D("Craft");
        $crafts = $craftModel->order("listorder ASC")->select();

        $model = D("GoodsCraftView");
        $tmp = $model->where("goods_id=".$goods_id)->order("listorder ASC")->select();
//        var_dump($tmp);
//        $model->getLastSql();exit;
        $goodsCrafts = array();
        foreach($tmp as $k=>$v) {
            $goodsCrafts[$v["craft_id"]] = $v;
        }

        
        //包含所有
        if(!$_GET["only_defined"]) {
            foreach($crafts as $k=>$v) {
                if($goodsCrafts[$v["id"]]) {
                    continue;
                } else {
                    $v["listorder"] = 0;
                    $goodsCrafts[$v["id"]] = $v;
                }
            }
        }

        $goodsCrafts = reIndex($goodsCrafts);
        
        $this->response($goodsCrafts);
    }
    
    public function update() {
        
        $id = abs(intval($_GET["id"]));
        
        $model = D("GoodsCraft");
        foreach($_POST as $k=>$v) {
            if($v["listorder"] <= 0) {
                continue;
            }
            $data[] = $v;
        }
        
        if(false === $model->updateGoodsCraft($id, $data)) {
            $this->error("update_error");
        } else {
            $this->success($msg);
        }
    }
    
}
