<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 6/22/15
 * Time: 10:56
 */

namespace Marketing\Model;


use Common\Model\CommonViewModel;

class ContractModel extends CommonViewModel {

    protected $viewFields = array(
        'Contract' => array('*', '_type'=>'left'),
        'SaleOpportunities' => array('name'=>'opportunities_name', 'customer_id', '_on'=>'Contract.sale_opportunities_id=SaleOpportunities.id', '_type'=>'left'),
        'Customer' => array('contacts_company_id', '_on'=>'Customer.id=SaleOpportunities.customer_id', '_type'=>'left'),
        'ContactsCompany' => array('name'=>'customer_name', '_on'=>'Customer.contacts_company_id=ContactsCompany.id', '_type'=>'left')
    );

}