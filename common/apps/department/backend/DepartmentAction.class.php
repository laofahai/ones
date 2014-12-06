<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of DepartmentAction
 *
 * @author nemo
 */
class DepartmentAction extends NetestCategoryAction {

    public function pretreatment() {
        $_POST["leader"] = implode(",", $_POST["leader"]);
//        print_r($_POST);exit;
    }

    public function index() {
        $data = parent::index(true);
        $users = getUserCache();

        foreach($data as $k=>$v) {
            if($v["leader"]) {
                $leadersLabel = array();
                $leaders = explode(",", $v["leader"]);
                foreach($leaders as $l) {
                    $leadersLabel[] = $users[$l]["truename"];
                }

                $data[$k]["leader"] = implode(",", $leadersLabel);
            }
        }

        $this->response($data);
    }


    /*
     * 判断用户是否可以负责某个部门
     * **/
    protected function ACT_canLeader($departmentId=null, $uid=null) {
        $departmentId = $departmentId ? $departmentId : $_GET["department"];
        $uid = $uid ? $uid : $_GET["user"];

        if(!$uid) {
            $uid = $this->user["id"];
        }

        $model = D("User");

        $this->response(array("isLeader"=> $model->canLeader($departmentId, $uid)));

    }

}
