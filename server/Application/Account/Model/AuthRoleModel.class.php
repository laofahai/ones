<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 5/31/15
 * Time: 22:09
 */

namespace Account\Model;


use Common\Model\CommonViewModel;

class AuthRoleModel extends CommonViewModel {

    protected $viewFields = array(
        'AuthRole' => array('*', '_type'=>'left')
    );

}