<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 5/30/15
 * Time: 23:19
 */

namespace Account\Model;


use Common\Model\CommonViewModel;

class UserModel extends CommonViewModel {

    public $real_model_name = 'User';

    protected $viewFields = array(
        'User' => array('id', 'login', 'email', 'realname', 'avatar', 'created', 'department_id', '_type'=>'left'),
        'Department' => array('name' => 'department', '_on'=>'User.department_id=Department.id', '_type'=>'left')
    );

}