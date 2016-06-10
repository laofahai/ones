<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 6/6/15
 * Time: 09:53
 */

namespace Crm\Controller;


use Common\Controller\BaseRestController;
use Common\Lib\CommonFilter;
use Crm\Service\CrmClueHeadLogService;

class CustomerController extends BaseRestController {

    protected function _filter(&$map) {
        unset($map['ContactsCompany.id']);

        // 客户池
        if(!I('get.id')) {
            if(I('get.action') != 'pool') {
                $map['Customer.head_id'] = array('GT', 0);
            } else {
                $map['Customer.head_id'] = array('EXP', 'IS NULL');
            }
        } else {
            unset($map['id']);
            $map['ContactsCompany.id'] = I('get.id');
        }

        if($map['by_user']) {
            $map = CommonFilter::by_user($map);
        }


    }

    protected function _before_insert() {
        if(!$_POST['head_id']) {
            unset($_POST['head_id']);
        } else {
            $_POST['head_id'] = is_array($_POST['head_id']) ? $_POST['head_id'] : explode(',', $_POST['head_id']);
            $_POST['head_id'] = $_POST['head_id'][0];
        }
    }


    public function on_put() {
        /*
         * 更新负责人状态
         * */
        if(I('post.action') == 'update_head') {
            $uid = I('post.uid') === "null" ? null : I('post.uid');
            if(false !== D('Crm/Customer', 'Service')->update_customer_head(I('post.customer_ids'), $uid)) {
                $this->success(__('common.Operation Success'));
            }
            return;
        }

        $com_id = I('get.id');

        $cus_model = D('Crm/Customer', 'Service');
        $customer = $cus_model->where(array(
            'contacts_company_id' => $com_id
        ))->find();

        // 更新往来单位
        $com_model = D('ContactsCompany/ContactsCompany', 'Service');
        $com_model->create(I('post.'));
        if(false === $com_model->where(array(
                'id' => $com_id
            ))->save()) {
            return $this->error(__('crm.Operation Failed'));
        }

        // 更新客户
        $com_model->create(I('post.'));
        if(false === $cus_model->where(array(
                'id' => $customer['id']
            ))->save()) {
            return $this->error(__('crm.Operation Failed'));
        }

        $this->success(__('crm.Operation Success'));

    }

    /*
     * 新增客户
     * */
    public function on_post() {

        $this->_before_insert();

        $clue_id = I('post.crm_clue_id');

        // 查看是否已转换
        if($clue_id) {
            $error = __('crm.This Clue is transformed yet');
            $clue_model = D('Crm/CrmClue');
            $clue = $clue_model->find($clue_id);
            if($clue['customer_id']) {
                return $this->error($error);
            }
        }


        $model = D('Crm/Customer', 'Service');

//        //角色
//        $_POST['contacts_company_role_id'] = D('Home/Config', 'Service')->get_kv_config('crm_customer_role');
//
//        if(!$_POST['contacts_company_role_id']) {
//            return $this->error(__('crm.Please set the default customer role first'));
//        }

        // 新增往来单位
        $com_model = D('ContactsCompany/ContactsCompany', 'Service');
        $com_model->create(I('post.'));
        $com_id = $com_model->add();

        if(!$com_id) {
            return $this->error(__('crm.Operation Failed').': '.$com_model->getDbError());
        }

        // 创建客户
        $_POST['contacts_company_id'] = $com_id;
        $model->create(I('post.'));
        $cus_id = $model->add();
        if(!$cus_id) {
            return $this->error(__('crm.Operation Failed').': '.$model->getDbError());
        }

        // 线索转换
        if($clue_id) {
            $clue_model->where(array(
                'id' => $clue_id
            ))->save(array(
                'customer_id' => $cus_id
            ));

            // 写转化客户日志
            D('Crm/CustomerHeadLog')->add(array(
                'type' => CustomerHeadLogService::TYPE_TRANSFORM,
                'crm_clue_id' => $clue_id
            ));

            // 将沟通记录记录到客户
            D('Crm/CustomerCommunicate')->where(array(
                'crm_clue_id' => $clue_id
            ))->save(array(
                'customer_id' => $cus_id
            ));
        }
    }

}