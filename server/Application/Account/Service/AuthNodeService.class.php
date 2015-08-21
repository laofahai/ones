<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 5/29/15
 * Time: 21:08
 */

namespace Account\Service;


use Common\Model\CommonModel;

class AuthNodeService extends CommonModel {

    public $not_belongs_to_company = true;

    public $AUTH_NODE_FLAGS = array();

    public function __construct($name='',$tablePrefix='',$connection='') {
        parent::__construct($name='',$tablePrefix='',$connection='');

        $this->AUTH_NODE_FLAGS = array(
            array('id'=>'1', 'label'=>__('common.Everybody')),
            array('id'=>'2', 'label'=>__('common.Self only')),
            array('id'=>'3', 'label'=>__('common.Self and directly subordinate')),
            array('id'=>'4', 'label'=>__('common.Self and all subordinate')),
            array('id'=>'5', 'label'=>__('common.Self department')),
            array('id'=>'6', 'label'=>__('common.Self department and it\'s subordinate department')),
            array('id'=>'0', 'label'=>'|---'.__('common.Confirm APP supported under this')),
            array('id'=>'7', 'label'=>__('common.Self Headed Only')),
            array('id'=>'8', 'label'=>__('common.Self and directly subordinate Headed')),
            array('id'=>'9', 'label'=>__('common.Self and all subordinate Headed'))
        );
    }

    /*
     * 获取节点授权标识
     * */
    public function get_flags() {
        return $this->AUTH_NODE_FLAGS;
    }

}
