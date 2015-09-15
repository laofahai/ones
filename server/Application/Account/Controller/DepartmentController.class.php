<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 6/4/15
 * Time: 21:19
 */

namespace Account\Controller;


use Common\Controller\BaseRestController;

class DepartmentController extends BaseRestController {

    /*
     * 获取部门列表
     * */
    public function on_list() {
        $model = D('Account/Department', "Service");
        $tree = $model->get_tree();

        $this->response($tree);
    }

    /*
     * 新增部门
     * */
    public function on_post() {

        $model = D('Account/Department', 'Service');

        $pid = I('post.pid');

        if(!$pid || !$model->find($pid)) {
            return $this->error(__('account.Parent Department Not Found'));
        }

        $data = array(
            'name' => I('post.name'),
            'leader' => implode(',', I('post.leader'))
        );


        if(!$model->add_child($pid, $data, 'department')) {
            return $this->error(__('account.Add Department Failed').':'.$model->getError());
        }

        $this->success(__('common.Operation Success'));
    }

}