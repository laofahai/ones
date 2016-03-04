<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 6/10/15
 * Time: 22:04
 */

namespace Crm\Model;


use Common\Model\CommonViewModel;

class CustomerModel extends CommonViewModel {

    protected $tableName = 'customer';

    protected $viewFields = array(
        'ContactsCompany' => array(
            'id',
            'name',
            'master',
            'mobile',
            'phone',
            'address',
            'created',
            'related_company_id',
            'contacts_company_role_id',
            'trashed',
            '_type' => 'left'
        ),
        'Customer' => array(
            'id'=>'customer_id',
            'contacts_company_id',
            'user_info_id',
            'source_from',
            'crm_clue_id',
            'company_id',
            'head_id',
            'next_contact_time',
            'next_contact_content',
            'last_contact_time',
            '_on'=>'Customer.contacts_company_id=ContactsCompany.id',
            '_type' => 'left'
        ),
        'ContactsCompanyRole'=>[
            'name' => 'contacts_company_role_id__label__',
            '_on' => 'ContactsCompany.contacts_company_role_id=ContactsCompanyRole.id',
            '_type' => 'left'
        ],
        'CommonType' => array('name'=>'source_from_label', '_on'=>'Customer.source_from=CommonType.id', '_type'=>'left')
    );

    public $fuzzy_search = [
        'ContactsCompany.name',
        'ContactsCompany.phone'
    ];

}