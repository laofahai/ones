<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of AuthGroupRuleAction
 *
 * @author nemo
 */
class AuthGroupRuleAction extends CommonAction {
    
    public function read() {
        
        $id = abs(intval($_GET["id"]));
        $groupRuleModel = D("AuthGroupRule");
        
        $groupModel = D("AuthGroup");
        $theGroup = $groupModel->find($id);
        
        $tmp = $groupRuleModel->where("group_id=".$id)->select();
        $selectedRules = array();
        $selectedRulesArray = array(
            "id_0" => false
        );
        foreach($tmp as $v){
            $selectedRules[] = $v["rule_id"];
            $selectedRulesArray["id_".$v["rule_id"]] = true;
        }
//        $selectedRules = explode(",", $theGroup["rules"]);
        
        $ruleModel = D("AuthRule");
        $theRules = $ruleModel->where("status=1")->select();
        
        foreach($theRules as $tr){
            if(in_array($tr["id"], $selectedRules)) {
                $tr["selected"] = 1;
            } else {
                $tr["selected"] = 0;
            }
            $rsRules[$tr["category"]][] = $tr;
        }
//        $rsRules = reIndex($rsRules);
//        print_r($rsRules);
        $return = array(
            "selected" => $selectedRulesArray,
            "rules"    => $rsRules
        );
        
//        print_r($return);exit;
        $this->response($return);
        
    }
    
    
    /**
     * @todo php://input 无法获取PUT数据
     */
    public function update() {
        $putData = I("put.");
        $putData = $putData ? $putData : $_POST;
        
        $gid = abs(intval($_GET["id"]));
        //@todo 整合到model
        $model = D("AuthGroupRule");
        $model->startTrans();
        $model->where("group_id=".$gid)->delete();
        
        $ids = array();
        $insertData = array();
        foreach($putData as $k=>$v) {
            $rule_id = str_replace("id_", "", $k);
            if($rule_id<=0) {
                continue;
            }
            if("true" === $v or $v > 0) {
                if(!$model->add(array(
                    "group_id" => $gid,
                    "rule_id"  => $rule_id,
                    "flag"     => 0
                ))){
                    $model->rollback();
                    $this->httpError(500);
                }
            }
        }
        
        
        $model->commit();
    }
}
