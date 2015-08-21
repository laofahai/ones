<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 6/20/15
 * Time: 23:13
 */

namespace Marketing\Model;


use Common\Model\CommonViewModel;

class SaleOpportunitiesModel extends CommonViewModel {

    protected $viewFields = array(
        'SaleOpportunities' => array('*', '_type'=>'left'),
        'Customer' => array('source_from', 'contacts_company_id', '_on'=>'SaleOpportunities.customer_id=Customer.id','_type'=>'left'),
        'ContactsCompany' => array('name'=>'customer', '_on'=>'Customer.contacts_company_id=ContactsCompany.id', '_type'=>'left'),
        'CommonType' => array('name'=>'status_label', '_on'=>'SaleOpportunities.status=CommonType.id', '_type'=>'left')
    );

}