<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 5/31/15
 * Time: 20:51
 */

namespace Account\Service;


use Common\Model\CommonTreeModel;

class DepartmentService extends CommonTreeModel {

    protected $_auto = array(
        array("company_id", "get_current_company_id", 1, "function")
    );

    protected $enable_trash = false;

    /*
     * 某用户是否为某部门负责人
     * @param integer $department_id
     * @param integer $uer_id default is current user id
     * @param boolean $directly 是否仅判断直接领导
     * */
    public function is_leader($department_id, $user_id=null, $directly=false) {
        $user_id = $user_id ? $user_id : get_current_user_id();

        if($directly) {}
    }

    /*
     * @override
     * */
    public function get_tree($pid=null) {
        $data = parent::get_tree($pid);

        $leaders = array();
        foreach($data as $k=>$v) {
            $leaders = array_merge($leaders, explode(',',$v['leader']));
        }
        if(!$leaders) {
            return $data;
        }

        $users = D('Account/UserInfo')->where(array(
            'id' => array("IN", array_filter($leaders))
        ))->select();

        $realnames = get_array_to_kv($users, 'realname');

        foreach($data as $k=>$v) {
            if(!$v['leader']) {
                continue;
            }
            $leaders_name = array();
            $the_leader = explode(',', $v['leader']);
            foreach($the_leader as $leader) {
                $leaders_name[] = $realnames[$leader];
            }

            $data[$k]['leader_label'] = implode(',', $leaders_name);

        }

        return $data;
    }

    /*
     * 获得某用户领导的部门列表
     * @param integer $uid
     * */
    public function get_user_leaded($uid=null) {
        $uid = $uid ? $uid : get_current_user_id();

        $departments = $this->where([])->select();

        $leaded = [];
        foreach($departments as $dep) {
            $leaders = explode(',', $dep['leader']);
            if(in_array($uid, $leaders)) {
                $leaded[] = $dep;
            }
        }

        return $leaded;
    }

    /*
     * 获得某用户负责的所有部门列表，包括子部门
     * @param integer $uid 默认为当前用户
     * */
    public function get_user_leaded_all($uid=null) {
        $uid = $uid ? $uid : get_current_user_id();

        $direct_leaded = $this->get_user_leaded($uid);

        if(!$direct_leaded) {
            return [];
        }

        $map = ['_string'=>''];
        foreach($direct_leaded as $dl) {
            $cond[] = sprintf('(lft>=%d) AND (rgt<=%d)', $dl['lft'], $dl['rgt']);
        }

        if(!$cond) {
            return $direct_leaded;
        }

        $map['_string'] = implode($cond, ' OR ');

        return $this->where($map)->select();

    }

    /*
     * 获取本部门下所有用户
     * */
    public function get_department_users($department_id, $include_sub = true) {
        $department_id_all = ['department_id'];
        if($include_sub) {
            $tree = $this->get_tree($department_id);
            $department_id_all = array_merge((array)get_array_by_field($tree, 'id'), $department_id_all);
        }

        $map = [
            'department_id' => ['IN', $department_id_all]
        ];

        return D('Account/UserInfo')->where($map)->select();

    }

}