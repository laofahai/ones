<?php
/**
 * Created by PhpStorm.
 * User: laofahai
 * Date: 16/3/4
 * Time: 上午10:06
 */

namespace Account\Model;


use Common\Model\CommonViewModel;

class AuthUserRoleModel extends CommonViewModel {

    protected $viewFields = [
        'AuthUserRole' => ['*', '_type'=>"left"],
        'AuthRole' => [
            'name', 'description', '_on'=>'AuthUserRole.auth_role_id=AuthRole.id', '_type' => 'left'
        ]
    ];

}