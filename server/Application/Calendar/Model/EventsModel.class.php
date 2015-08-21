<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 6/10/15
 * Time: 10:58
 */

namespace Calendar\Model;


use Common\Model\CommonViewModel;

class EventsModel extends CommonViewModel {

    protected $viewFields = array(
        'Events' => array('*', '_type'=>'left'),
        'User' => array('realname', 'avatar', 'email', '_on'=>'Events.user_id=User.id', '_type'=>'left'),
        'Department' => array('name'=>'department_name', '_on'=>'User.department_id=Department.id', '_type'=>'left')
    );

}