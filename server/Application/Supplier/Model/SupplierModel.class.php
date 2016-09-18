<?php

/*
 * @app Supplier
 * @package Supplier.model.Supplier
 * @author laofahai@TEam Swift
 * @link http://ng-erp.com
 * */
namespace Supplier\Model;
use Common\Model\CommonViewModel;

class SupplierModel extends CommonViewModel {

    protected $tableName = 'supplier';

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
        'Supplier' => array(
            'id'=>'supplier_id',
            'contacts_company_id',
            'user_info_id',
            'company_id',
            'head_id',
            'level',
            '_on'=>'Supplier.contacts_company_id=ContactsCompany.id',
            '_type' => 'left'
        )
    );

    public $fuzzy_search = [
        'ContactsCompany.name',
        'ContactsCompany.phone'
    ];

}