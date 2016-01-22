<?php

namespace Account\Controller;
use Common\Controller\BaseRestController;

class UserInfoController extends BaseRestController {

    public function on_read() {
        $user_info = parent::on_read(true);
        $auth_user_role_model = D("AuthUserRole");
        $roles = $auth_user_role_model->where(['user_info_id'=>$user_info['id']])->select();

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
        list($hashed_password, $rand_hash) = D('Account/UserInfo')->generate_password($_POST['password']);
        $_POST['password'] = $hashed_password;
        $_POST['rand_hash'] = $rand_hash;
    }
    // 处理用户角色
    protected function _after_insert($uid) {
        $roles = I('post.auth_role_id');
        if(!is_array($roles)) {
            $roles = explode(',', $roles);
        }
        D('Account/UserInfo')->change_user_role($uid, $roles);
    }

    // 修改密码
    public function _EM_change_password() {
        $old_password = I('post.old_password');
        $new_password = I('post.new_password');
        $user_id = I('get.id');
        if(!$user_id || $user_id != get_current_user_id()) {
            return $this->error(__('account.Params Error'));
        }

        if(!$old_password || !$new_password) {
            return $this->error(__('account.Every item is required'));
        }

        $user_service = D('Account/UserInfo');
        $user = $user_service->where(['id'=>$user_id])->find();

        list($old_hashed_password) = generate_password($old_password, $user['rand_hash']);

        if($old_hashed_password !== $user['password']) {
            return $this->error(__('account.Old password not equal to saved'));
        }

        list($new_password_hashed, $new_hash) = generate_password($new_password);
        $user_service->where(['id'=>$user_id])->save([
            'password' => $new_password_hashed,
            'rand_hash'=> $new_hash
        ]);

        $this->logout();
    }

    /*
     * 退出登录
     * */
    public function logout() {
        session('[destroy]');
    }

}