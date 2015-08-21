<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 7/5/15
 * Time: 21:24
 */

namespace Bpm\Model;


use Common\Model\CommonViewModel;

class WorkflowModel extends CommonViewModel {

    protected $viewFields = array(
        'Workflow' => array('*', '_type'=>'left'),
        'App' => array('alias'=>'app_alias', '_on'=>'Workflow.app_id=App.id', '_type'=>'left')
    );
}