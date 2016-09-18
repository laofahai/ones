<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 5/29/15
 * Time: 19:49
 */

namespace Account\Service;

use Common\Model\CommonModel;

class AuthorizeService extends CommonModel {

    static public $authed_nodes = array();

    public $not_belongs_to_company = true;


    /*
     * 对角色授权
     * @param $role_id 被授权角色ID
     * @param $nodes 授权数组 [ {node:x, flag:x} ]
     * */
    public function authorize($role_id, $nodes, $company=null) {
        $data = array();
        $included_id = array(0);
        $nodes = is_array($nodes) ? $nodes : [$nodes];
        $authed_nodes = get_array_to_kv($this->get_authed_nodes_by_role($role_id), 'flag', 'auth_node_id');
        foreach($nodes as $node) {

            if($node['node']) {
                $included_id[] = $node['node'];
            }

            // 在已授权列表中
            if(array_key_exists($node['node'], $authed_nodes) && $authed_nodes[$node['node']] == $node['flag']) {
                continue;
            }

            array_push($data, array(
                'auth_node_id' => $node['node'],
                'flag' => $node['flag'],
                'auth_role_id' => $role_id,
                'company_id' => $company ? $company : get_current_company_id()
            ));

        }

        if(!$data) {
            return true;
        }


        foreach($data as $k=>$v) {
            if(!$v['auth_node_id']) {
                continue;
            }
            if(!$this->add($v)) {
                $this->error = __('account.Authorize Failed');
                $this->error.= $this->getLastSql();
                return false;
            }
        }

        $this->where(array(
            'auth_node_id' => array('NOT IN', $included_id),
            'auth_role_id' => $role_id
        ))->delete();

        return true;

    }

    /*
     * 获取用户已授权节点
     * @param $user_id
     * */
    public function get_authed_nodes($user_id = null) {
        $user_id = $user_id ? $user_id : get_current_user_id();

        $cache_key = get_company_cache_key('authed/nodes_user_'.$user_id);
        $cached = F($cache_key);

        if(!DEBUG && $cached) {
            return $cached;
        }

        $role_map_model = D('Account/AuthUserRole');
        $user_roles = $role_map_model->where(array('user_info_id'=>$user_id))->select();

        $roles = get_array_by_field($user_roles, "auth_role_id");

        if(!$roles) {
            return array();
        }

        $authorize_model = D('Account/Authorize', 'Model');
        $nodes = $authorize_model->where(array(
            'auth_role_id' => array('IN', $roles)
        ))->select();

        $data = get_array_to_ka($nodes, 'id');

        F($cache_key, $data);
        return $data;

    }

    /*
     * 获取角色已授权节点
     * */
    public function get_authed_nodes_by_role($role_id) {
        $cache_key = get_company_cache_key('authed/nodes_role_'.$role_id);
        $cached = F($cache_key);

        if(!DEBUG && $cached) {
            return $cached;
        }

        $nodes = $this->where(array(
            'auth_role_id' => $role_id
        ))->select();

        $data = get_array_to_ka($nodes, 'id');

        F($cache_key, $data);
        return $data;
    }

    /*
     * 为查询条件map 根据node 授权flag的条件
     * */
    static public function get_map_by_flag($flag, $map, $model_name=null) {
        $field_name = $model_name ? $model_name.'.user_info_id' : 'user_info_id';

        $user_service = D('Account/Department', 'Service');
        switch($flag) {
            case "1": // 自己
                break;
            case "2": // 所有人
                $map[$field_name] = get_current_user_id();
                break;
            case "3": // 自己和直属下属
                $subs = $user_service->get_directly_subordinates();
                if($subs) {
                    $map[$field_name] = array("IN", get_array_to_kv($subs, 'id'));
                }
                break;
            case "4": // 自己和所有下属
                break;
            case "5": // 自己部门
                break;
            case "6": // 自己部门及部门下属部门
                break;
            case "7": // 自己负责
                break;
            case "8": // 自己及直属下属负责
                break;
            case "9": // 自己及所有下属负责
                break;
        }
        return $map;
    }

    /*
     * 设置当前用户已授权节点
     * */
    static public function set_authed_nodes($nodes) {
        self::$authed_nodes = $nodes;
    }

}