<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 5/29/15
 * Time: 22:24
 */

namespace Account\Model;


use Common\Model\CommonViewModel;

class AuthorizeModel extends CommonViewModel {

    public $not_belongs_to_company = true;

    protected $viewFields = array(
        'Authorize' => array('*', '_type'=>'left'),
        'AuthNode'  => array('node', 'app', '_on'=>'Authorize.auth_node_id=AuthNode.id', '_type'=>'left')
    );

}