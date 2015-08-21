<?php

namespace Account\Controller;
use Common\Controller\BaseRestController;

class UserController extends BaseRestController {

    public function on_read() {
        $data = parent::on_read(true);
        $model = D("AuthUserRole");
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