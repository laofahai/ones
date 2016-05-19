<?php
namespace Account\Service;

use Common\Model\CommonRelationModel;

class UserInfoService extends CommonRelationModel {

    public $not_belongs_to_company = true;

    public $real_model_name = 'UserInfo';

    public $tableName = 'user_info';
    
    protected $_link = array(
        'Company' => self::BELONGS_TO,
        'Department' => self::BELONGS_TO
    );

    protected $_auto = array(
        array("company_id", "get_current_company_id", 1, "function")
    );

    public function is_login() {
        return session('user.id') ? true : false;
    }
    
    /*
     * 用户登陆认证
     * @param String $company_sign_id 用户所属企业标识
     * @param String $login 登录名
     * @param String $password 密码
     * @return
     *  -1: company not found
     *  -2: user not found
     *  -3: password does not match
     *  true: success
     * 
     * @plugin after_user_authenticated
     * @plugin_param $user
     * @plugin_param $company
     * **/
    public function authenticate($company_sign_id, $login, $password) {

        if($this->is_login()) {
            return true;
        }

        $company = D("Account/Company")->where(array('sign_id'=>$company_sign_id))->find();

        if(!$company || !$company['is_active']) {
            return -1;
        }
        $user = $this->where(array(
            "company_id" => $company['id'],
            "login" => $login
        ))->relation(false)->find();

        if(!$user) {
            return -2;
        }

        $hashed = $this->generate_password($password, $user['rand_hash']);
        if($user['password'] !== $hashed[0]) {
            return -3;
        }
        
        $params = array(
            $user,
            $company
        );
        tag('after_user_authenticated', $params);
        list($user, $company) = $params;

        session('[destroy]');
        session('[start]');
        session('[regenerate]');

        $is_super_user = false;

        if($company['superuser'] && $company['superuser'] == $user["id"]) {
            $is_super_user = true;
        }

        session('user', array(
            "login" => $user["login"],
            "id"    => $user["id"],
            "realname" => $user["realname"],
            "email" => $user["email"],
            "avatar"=> $user["avatar"],
            "company" => $company,
            "is_super_user" => $is_super_user
        ));
        


        return true;
    }
    
    /*
     * 是否本公司的超级管理
     * **/
    public function is_super_user($id = null) {
        $company_info = D('Account/Company')->find(get_current_company_id());
        $id = $id ? $id : get_current_user_id();
        return $company_info['superuser'] == $id;
    }
    
    /*
     * 根据明文密码生成加密密码
     * **/
    public function generate_password($source, $rand_hash=false) {
        return generate_password($source, $rand_hash);
    }

    /*
     * 返回当前用户session
     * **/
    public function get_current_user() {
        return session('user');
    }

    /*
     * 返回当前用户所属公司信息
     * */
    public function get_current_company() {
        return session("user.company");
    }

    /*
     * 获得所有用户的基本不敏感信息
     * */
    static public function get_all_basic_data($user_id=null) {
        $model = D('Account/UserInfo','Model');
        $users = $model->where(array(
            'UserInfo.company_id' => get_current_company_id()
        ))->select();

        $available = array('id', 'login', 'email', 'avatar', 'department_id__label__', 'realname');
        $return = array();
        foreach($users as $k=>$v) {
            $tmp = array();
            foreach($v as $field=>$value) {
                if(!in_array($field, $available)) {
                    continue;
                }
                $tmp[$field] = $value;
            }
            $return[$v['id']] = $tmp;
        }

        return $user_id ? $return[$user_id] : $return;
    }

    /*
     * 获得当前用户的所有直接下属
     * */
    public function get_directly_subordinates($uid=null, $include_itself=false) {

        $uid = $uid ? $uid : get_current_user_id();

        $leaded = D('Account/Department')->get_user_leaded($uid);
        $leaded_ids = get_array_by_field($leaded, 'id');

        $users = $this->where(array(
            'department_id' => array('IN', $leaded_ids)
        ));

        if(!$include_itself) {
            foreach($users as $k=>$user) {
                if($user['id'] == $uid) {
                    unset($users[$k]);
                    break;
                }
            }
        }

        return $users;
    }

    /*
     * 获得当前用户的所有下属
     * */
    public function get_all_subordinates($uid=null, $include_itself=false) {
        $uid = $uid ? $uid : get_current_user_id();
        $leaded = D('Account/Department')->get_user_leaded_all($uid);
        $leaded_department_ids = get_array_by_field($leaded, 'id');

        $users = $this->where(array(
            'department_id' => array('IN', $leaded_department_ids)
        ))->select();

        if(!$include_itself) {
            foreach($users as $k=>$user) {
                if($user['id'] == $uid) {
                    unset($users[$k]);
                    break;
                }
            }
        }

        return $users;
    }

    /*
     * 变更用户角色
     * */
    public function change_user_role($uid, $role_ids) {
        $auth_roles = D('Account/AuthRole')->where([])->select();
        $auth_roles = get_array_by_field($auth_roles, 'id');

        $role_ids = array_intersect($role_ids, $auth_roles);

        $auth_role_service = D('Account/AuthUserRole');
        $auth_role_service->where([
            'user_info_id' => $uid
        ])->delete();

        $company_id = get_current_company_id();
        foreach($role_ids as $role_id) {
            $auth_role_service->add([
                'user_info_id' => $uid,
                'company_id' => $company_id,
                'auth_role_id' => $role_id
            ]);
        }

    }
}