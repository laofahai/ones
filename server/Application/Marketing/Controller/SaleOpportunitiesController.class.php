<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 6/20/15
 * Time: 23:12
 */

namespace Marketing\Controller;


use Common\Controller\BaseRestController;
use Common\Lib\CommonFilter;

class SaleOpportunitiesController extends BaseRestController {

    protected function _filter(&$map) {
        // 根据用户过滤
        if($map['by_user']) {
            $map = CommonFilter::by_user($map);
        }

        // 根据时间区间过滤
        if($map['date_range']) {
            $map = CommonFilter::by_date_range($map);
        }
    }

    protected function _before_insert() {
        $_POST['customer_id'] = D('Crm/Customer')->where(array(
            'contacts_company_id' => $_POST['customer_id']
        ))->getField('id');

        if(I('post.head_id')) {
            $_POST['head_id'] = process_with_item_select_ids('head_id');
        }
    }

    protected function _before_update() {
        if(I('post.head_id')) {
            $_POST['head_id'] = process_with_item_select_ids('head_id');
        }
    }

    public function on_post() {

        if(!I('get.is_push')) {
            return parent::on_post();
        }

        $_GET['id'] = I('get.opp_id');

//        print_r(I('get.id'));exit;

        $rs = parent::on_put();
        if(false !== $rs && I('get.is_push')) {
            // 写客户沟通日志

            $stage = D('Home/CommonType')->where(array('id'=>I('post.status')))->getField('name');
            $source = D('Marketing/SaleOpportunities')->find(I('get.id'));

            $content = sprintf(__('marketing.Push Opportunities To %s Stage'), '`'.$stage.'`');
            $content.= "\n\n";
            $content.= I('post.push_remark');

            $model = D('Crm/CustomerCommunicate');
            $model->add(array(
                'content' => $content,
                'created' => I('post.last_contact_time'),
                'sale_opportunities_id' => I('get.id'),
                'customer_id' => $source['customer_id'],
                'company_id' => get_current_company_id(),
                'user_info_id' => get_current_user_id()
            ));

//            echo $model->getLastSql();

        }
    }

}