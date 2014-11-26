<?php

/**
 * @filename UserModel.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-11-18  13:35:50
 * @Description
 * 
 */
class UserModel extends CommonModel {
    
    protected $_auto = array(
        array("status", 1),
        array("password", "getPwd", 3, "function"),
    );
    
    public function select($options=array()) {
        $data = parent::select($options);
        foreach($data as $k=>$v) {
            unset($data[$k]["password"]);
        }
        return $data;
    }

    /*
     * 用户是否对某部门有负责权限
     * 主要检测子部门
     * **/
    public function canLeader($departmentId, $uid=null) {
        $uid = $uid ? $uid : getCurrentUid();

        $departments = D("Department")->getNodePath($departmentId);

        $departments = array_reverse($departments);

        $isLeader = false;
        foreach($departments as $dep) {
            $leader = explode(",", $dep["leader"]);
            if($leader && in_array($uid, $leader)) {
                $isLeader = true;
                break;
            }
        }

        return $isLeader;
    }

    public function getLeadedUsers($onlyId=true, $uid=null, $includeSelf=true) {

        $map = array(
            "department_id" => array("IN", $this->getLeadedDepartments(true, $uid)),
        );

        if($includeSelf) {
            $map["id"] = getCurrentUid();
            $map["_logic"] = "OR";
        }

        $leadedUsers = $this->where($map)->select();

        if(!$onlyId) {
            return $leadedUsers;
        }

        return getArrayField($leadedUsers);

    }

    public function getLeadedDepartments($onlyId=true, $uid=null) {
        $uid = $uid || getCurrentUid();

        $model = D("Department");

        $theUser = $this->find($uid);

        //获取用户所在部门的所有子集部门(包含当前部门)
        $tmp = $model->getTree($theUser["department_id"]);

        $leaded = array();
        foreach($tmp as $dep) {
            if(inExplodeArray($uid, $dep["leader"])) {
                $leaded[] = $dep["id"];
            }
        }

        $departments = array();
        //遍历查询效率问题
        foreach($leaded as $lead) {
            $departments = array_merge($departments, (array)$model->getTree($lead));
        }

        if(!$onlyId) {
            return $departments;
        }

        return getArrayField($departments);
    }
    
}

