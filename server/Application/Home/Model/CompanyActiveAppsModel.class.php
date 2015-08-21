<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 7/5/15
 * Time: 21:36
 */

namespace Home\Model;


use Common\Model\CommonViewModel;

class CompanyActiveAppsModel extends CommonViewModel {

    protected $viewFields = array(
        'CompanyActiveApps' => array('app_id'=>'id', '_type'=>'left'),
        'App' => array('alias', '_on'=>'App.id=CompanyActiveApps.app_id', '_type'=>'left')
    );

}