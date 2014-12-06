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
        $groupRuleModel = D("AuthGroupRuleView");
        
        $groupModel = D("AuthGroup");
        $theGroup = $groupModel->find($id);
        
        $tmp = $groupRuleModel->where("AuthGroupRule.group_id=".$id)->select();

        $selectedRules = array();
        foreach($tmp as $v){
            $selectedRules[] = $v["rule_id"];
            $selectedRulesArray[$v["name"]] = true;
        }
//        $selectedRules = explode(",", $theGroup["rules"]);
//        print_r($tmp);
        $ruleModel = D("AuthRule");
        $theRules = $ruleModel->where("status=1")->select();
        
        foreach($theRules as $rule){
            if(in_array($rule["id"], $selectedRules)) {
                $rule["selected"] = 1;
            } else {
                $rule["selected"] = 0;
            }
            $rsRules[$rule["category"]][] = $rule;
        }
//        $rsRules = reIndex($rsRules);

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
        $putData = $_POST;
        
        $gid = abs(intval($_GET["id"]));

        $tmp = D("AuthRule")->select();
        foreach($tmp as $v) {
            $nodes[$v["name"]] = $v;
        }

        $model = D("AuthGroupRule");
        $model->startTrans();
        $model->where("group_id=".$gid)->delete();
        
        foreach($putData["nodes"] as $nodeName=>$v) {
            if("true" === $v or $v > 0) {
                if(!$model->add(array(
                    "group_id" => $gid,
                    "rule_id"  => $nodes[$nodeName]["id"],
                    "flag"     => 0
                ))){
                    Log::write("SQL Error:".$model->getLastSql(), Log::SQL);
                    $model->rollback();
                    $this->httpError(500);
                }
            }
        }
        
        
        $model->commit();
    }
}
