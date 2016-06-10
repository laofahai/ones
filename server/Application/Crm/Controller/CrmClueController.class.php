<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 6/6/15
 * Time: 09:52
 */

namespace Crm\Controller;


use Common\Controller\BaseRestController;
use Common\Lib\CommonFilter;

class CrmClueController extends BaseRestController {

    protected function _filter(&$map) {

        // 线索池
        switch(I('get.action')) {
            case "pool":
                $map['head_id'] = array('EXP', 'IS NULL');
                break;
            default:
                if(!I('get.id')) {
                    $map['head_id'] = array('GT', 0);
                }
            break;
        }

        // 根据用户过滤
        if(!I('get.id')) {
            $map['customer_id'] = array('EXP', 'IS NULL');
        }

        if($map['by_user'] === 'transformed') {
            $map['customer_id'] = ['NEQ', 'NULL'];
        } else if($map['by_user']) {
            $map = CommonFilter::by_user($map);
        }
        unset($map['by_user']);



        // 根据时间区间过滤
        if($map['date_range']) {
            $map = CommonFilter::by_date_range($map);
        }

    }

    public function _before_insert() {
        if($_POST['head_id']) {
            $_POST['head_id'] = is_array($_POST['head_id']) ? $_POST['head_id'][0] : $_POST['head_id'];
        }

    }

    /*
     * 更新线索状态
     * */
    public function on_put() {
        if(I('post.action') == 'update_head') {
            $uid = I('post.uid') === "null" ? null : I('post.uid');
            if(false !== D('Crm/CrmClue', 'Service')->update_clue_head(I('post.clue_id'), $uid)) {
                $this->success(__('common.Operation Success'));
            }
            return;
        }
        parent::on_put();

    }

}