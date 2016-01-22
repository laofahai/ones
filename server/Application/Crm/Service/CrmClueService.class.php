<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 6/6/15
 * Time: 13:35
 */

namespace Crm\Service;


use Common\Model\CommonModel;

class CrmClueService extends CommonModel {

    protected $_auto = array(
        array("user_info_id", "get_current_user_id", 1, "function"),
        array("company_id", "get_current_company_id", 1, "function")
    );

    /*
     * 更新线索负责人
     * @todo 分配操作
     * */
    public function update_clue_head($ids, $uid) {

        if(!$ids) {
            return;
        }

        // 原始数据
        $source = array();
        if(!$uid) {
            $source = $this->where(array('id'=>array("IN", $ids)))->select();
            $source = get_array_to_kv($source, 'user_info_id', 'id');
        }

        $result = $this->where(array(
            "id" => array("IN", $ids)
        ))->save(array(
            "head_id" => $uid
        ));

        if(false === $result) {
            return $result;
        }

        $head_model = D('Crm/CustomerHeadLog');
        $company_id = get_current_company_id();
        $type = $uid ? 1 : 2;
        foreach($ids as $id) {
            $user_id = $uid ? $uid : $source[$id];
            $head_model->add(array(
                'type' => $type,
                'company_id' => $company_id,
                'crm_clue_id'=> $id,
                'user_info_id' => $user_id
            ));
        }
        return $result;
    }

}