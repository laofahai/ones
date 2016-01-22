<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 6/10/15
 * Time: 23:09
 */

namespace Crm\Service;


use Common\Model\CommonModel;

class CustomerService extends CommonModel {

    protected $_auto = array(
        array("user_info_id", "get_current_user_id", 1, "function"),
        array("company_id", "get_current_company_id", 1, "function")
    );

    /*
     * 更新线索负责人
     * @todo 分配操作
     * */
    public function update_customer_head($ids, $uid) {

        if(!$ids) {
            return;
        }

        $company_id = get_current_company_id();

        // 原始数据
        $source = array();
        if(!$uid) {
            $source = $this->where(array('id'=>array("IN", $ids)))->select();
            $source = get_array_to_kv($source, 'user_info_id', 'id');
        }

        // 往来单位
        $contacts_company = D('ContactsCompany/ContactsCompany', 'Service')->where(array(
            'id' => array("IN", $ids)
        ))->select();
        $contacts_company = get_array_to_ka($contacts_company);

        foreach($ids as $id) {
            $map = array(
                'contacts_company_id' => $id,
                'company_id' => $company_id
            );
            $exists = $this->where($map)->find();
            if($exists) { // 已存在更新负责人ID
                $this->where($map)->save(array(
                    'head_id' => $uid
                ));
            } else { // 不存在新增一条
                $data = array(
                    'contacts_company_id' => $id,
                    'head_id' => $uid,
                    'user_info_id' => $uid,
                    'crm_clue_id' => null,
                    'company_id'  => $company_id,
                    'source_from' => $contacts_company[$id]['source_form']
                );
                $this->add($data);
            }
        }


        $head_model = D('Crm/CustomerHeadLog');

        $type = $uid ? 1 : 2;
        foreach($ids as $id) {
            $user_id = $uid ? $uid : $source[$id];
            $head_model->add(array(
                'type' => $type,
                'company_id' => $company_id,
                'customer_id'=> $id,
                'user_info_id' => $user_id
            ));
        }
        return true;
    }

}