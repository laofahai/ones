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
        foreach($tmp as $v){
            $selectedRules[] = $v["rule_id"];
            $selectedRulesArray[$v["rule_id"]] = true;
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
        $this->response($return);
        
    }
    
    
    public function update() {
        $gid = abs(intval($_GET["id"]));
        //@todo 整合到model
        $model = D("AuthGroupRule");
        $model->startTrans();
        $model->where("group_id=".$gid)->delete();
        
        $putData = I("put.");
        $ids = array();
        $insertData = array();
        foreach($putData as $k=>$v) {
            if("true" === $v) {
                if(!$model->add(array(
                    "group_id" => $gid,
                    "rule_id"  => $k,
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
