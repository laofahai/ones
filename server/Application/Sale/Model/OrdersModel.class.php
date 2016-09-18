<?php

/*
 * @app Sale
 * @package Sale.model.Orders
 * @author laofahai@TEam Swift
 * @link http://ng-erp.com
 * */
namespace Sale\Model;
use Common\Model\CommonViewModel;

class OrdersModel extends CommonViewModel {

    protected $viewFields = [
        "Orders" => ['*', '_type'=>'left'],
        "Customer" => [
            'contacts_company_id',
            '_on' => 'Orders.customer_id=Customer.id',
            '_type' => 'left'
        ],
        "ContactsCompany" => [
            'name' => 'customer_id__label__',
            'address' => 'customer_address',
            'phone' => 'customer_phone',
            '_on' => 'Customer.contacts_company_id=ContactsCompany.id',
            '_type' => 'left'
        ],
        "Workflow" => [
            'name' => 'workflow_id__label__',
            '_on' => 'Orders.workflow_id=Workflow.id',
            '_type' => 'left'
        ]
    ];

    public $fuzzy_search = [
        'Orders.bill_no', 'Orders.subject',
        'ContactsCompany.name'
    ];

}