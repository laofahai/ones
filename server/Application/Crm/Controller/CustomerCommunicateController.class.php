<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 6/8/15
 * Time: 18:24
 */

namespace Crm\Controller;


use Common\Controller\BaseRestController;
use Home\Service\AppService;

class CustomerCommunicateController extends BaseRestController {

    protected function _before_insert() {

        // 修正客户ID
        if(I('post.customer_id')) {
            $com_model = D('Crm/Customer');
            $_POST['customer_id'] = $com_model->where(array(
                'contacts_company_id' => I('post.customer_id')
            ))->getField('id');
        }

        // 如果沟通记录中包含了下次联系时间
        if(I('post.next_contact_time') && I('post.next_contact_content')) {

            // 线索、客户、商机等时间，更新
            if(I('post.crm_clue_id')) {  // 线索
                $id = I('post.crm_clue_id');
                $model = "Crm/CrmClue";
            } else if(I('post.customer_id')) {  // 客户
                $id = I('post.customer_id');
                $model = "Crm/Customer";
            }
            if($model && $id) {
                D($model)->save(array(
                    'id' => $id,
                    'next_contact_time' => I('post.next_contact_time'),
                    'next_contact_content' => I('post.next_contact_content')
                ));

                $_POST['content'] = I('post.content')."\n\n`"
                    .sprintf(__('crm.Next Contact Time %s, Subject is %s'),
                        date('Y-m-d H:i', strtotime(I("post.next_contact_time"))),
                        I("post.next_contact_content")
                    ).'`';
            }
        }
    }

    protected function _after_insert($id) {
        // 线索、客户、商机等上次联系时间，更新
        if(I('post.crm_clue_id')) {  // 线索
            $related_id = I('post.crm_clue_id');
            $model = "Crm/CrmClue";
        } else if(I('post.customer_id')) {  // 客户
            $related_id = I('post.customer_id');
            $model = "Crm/Customer";
        }
        if($model && $id) {
            D($model)->where(array(
                'id' => $id,
                'company_id' => get_current_company_id()
            ))->save(array(
                'last_contact_time' => date('Y-m-d H:i:s')
            ));
        }
        if(I('post.next_contact_time') && I('post.next_contact_content') && $related_id) {
            // 更新日程
            if(AppService::is_app_active('calendar')) {
                $event_service = D('Calendar/Events');
                $event_service->create([
                    'subject' => I('post.next_contact_content'),
                    'type'    => 'info',
                    'start_at'=> I('post.next_contact_time'),
                    'end_at'  => I('post.next_contact_time'),
                    'related_model' => $this->module_alias,
                    'related_id'    => $related_id
                ]);
                $event_service->add();
            }
        }
    }

    protected function _order(&$order) {
        $order = 'CustomerCommunicate.created DESC';
    }

    /*
     * 合并head_log
     * */
    public function on_list() {
        $data = parent::on_list(true);

        switch(I('get._mf')) {
            case "ContactsCompany.id":
                $head_log = D('Crm/CustomerHeadLog', 'Model')->get_by_customer(I('get._mv'), true);
                break;
            case "crm_clue_id":
            default:
                return $this->response($data, 'customer_communicate', true);

        }

        if($head_log) {
            foreach($head_log as $k=>$v) {
                $head_log[$k]['content'] = __('crm.Customer Head Log Type '.$v['type']);
            }
            $data = array_merge((array)$data, $head_log);
            // 按时间排序
            $data = multi_array_sort($data, 'created', SORT_DESC);
        }

        return $this->response($data, 'customer_communicate', true);
    }


}