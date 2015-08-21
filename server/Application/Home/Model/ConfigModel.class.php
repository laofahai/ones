<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 6/6/15
 * Time: 22:09
 */

namespace Home\Model;


use Common\Model\CommonViewModel;

class ConfigModel extends CommonViewModel {

    protected $viewFields = array(
        'Config' => array('*')
    );

}