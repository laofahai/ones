<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 5/30/15
 * Time: 23:19
 */

namespace Account\Model;


use Common\Model\CommonViewModel;

class UserInfoModel extends CommonViewModel {

    public $real_model_name = 'UserInfo';

    public $tableName = 'user_info';

    protected $viewFields = array(
        'UserInfo' => array('id', 'login', 'email', 'realname', 'created', 'department_id', '_type'=>'left'),
        'Department' => array('name' => 'department_id__label__', '_on'=>'UserInfo.department_id=Department.id', '_type'=>'left')
    );

}