<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 6/16/15
 * Time: 11:20
 */

namespace Crm\Model;


use Common\Model\CommonViewModel;

class CustomerCareModel extends CommonViewModel {

    protected $viewFields = array(
        'CustomerCare' => array('*', '_type'=>'left'),
        'CommonType' => array('name'=>'get_type_display', '_on'=>'CustomerCare.type=CommonType.id', '_type'=>'left')
    );

    protected $order = "CustomerCare.created DESC, CustomerCare.id DESC";

}