<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 6/10/15
 * Time: 20:52
 */

namespace Crm\Model;


use Common\Model\CommonViewModel;

class CustomerHeadLogModel extends CommonViewModel {

    protected $viewFields = array(
        'CustomerHeadLog' => array('*', '_type'=>'left')
    );

    /*
     * @param integer $cus_id 客户ID/往来单位ID
     * @param boolean $is_contacts_company_id 是否是往来单位ID
     * */
    public function get_by_customer($cus_id, $is_contacts_company_id=false) {
        $customer = array();
        if($is_contacts_company_id) {
            $customer = D('Crm/Customer')->where(array(
                'contacts_company_id' => $cus_id
            ))->find();
            $cus_id = $customer['id'];

            if(!$customer) {
                $this->error = __('crm.Customer Not Found');
                return false;
            }
        }

        if(!$customer) {
            $customer = D('Crm/Customer')->find($cus_id);
        }

        $map = array(
            'customer_id' => $cus_id
        );

        // 包含源线索信息
        if($customer['crm_clue_id']) {
            $map['crm_clue_id'] = $customer['crm_clue_id'];
            $map['_logic'] = 'OR';
        }

        return $this->where($map)->select();
    }

}