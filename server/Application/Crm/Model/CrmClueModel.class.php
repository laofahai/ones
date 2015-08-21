<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 6/6/15
 * Time: 09:54
 */

namespace Crm\Model;


use Common\Model\CommonViewModel;

class CrmClueModel extends CommonViewModel {

    protected $viewFields = array(
        'CrmClue' => array('*', '_type'=>'left'),
        'CommonType' => array('name'=>'source_from_label', '_on'=>'CrmClue.source_from=CommonType.id', '_type'=>'left')
    );


}