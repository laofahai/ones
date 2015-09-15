<?php

namespace Account\Controller;
use Common\Controller\BaseRestController;

class UserController extends BaseRestController {

    public function on_read() {
        $user_info = parent::on_read(true);
        $auth_user_role_model = D("AuthUserRole");
        $roles = $auth_user_role_model->where(['user_id'=>$user_info['id']])->select();

        $user_info['auth_role_id'] = [];
        foreach($roles as $role) {
            array_push($user_info['auth_role_id'], (int)$role['auth_role_id']);
        }

        $this->response($user_info, 'user', true);
    }

    /*
     * 新增用户插入
     * */
    protected function _before_insert() {
        list($hashed_password, $rand_hash) = D('Account/User')->generate_password($_POST['password']);
        $_POST['password'] = $hashed_password;
        $_POST['rand_hash'] = $rand_hash;
    }
    // 处理用户角色
    protected function _after_insert($uid) {
        $roles = I('post.auth_role_id');
        if(!is_array($roles)) {
            $roles = explode(',', $roles);
        }
        D('Account/User')->change_user_role($uid, $roles);
    }

    /*
     * 退出登录
     * */
    public function logout() {
        session('[destroy]');
    }

}