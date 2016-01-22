<?php

/*
 * @app Sale
 * @package Sale.model.Orders
 * @author laofahai@TEam Swift
 * @link https://ng-erp.com
 * */
namespace Sale\Model;
use Common\Model\CommonViewModel;

class OrdersModel extends CommonViewModel {

    protected $viewFields = [
        "Orders" => ['*', '_type'=>'left'],
        "UserInfo" => [
            'login',
            'realname',
            '_on'=>"Orders.user_info_id=UserInfo.id",
            '_type'=>'left'
        ],
        "Customer" => [
            'contacts_company_id',
            '_on' => 'Orders.customer_id=Customer.id',
            '_type' => 'left'
        ],
        "ContactsCompany" => [
            'name' => 'customer_id__label__',
            '_on' => 'Customer.contacts_company_id=ContactsCompany.id',
            '_type' => 'left'
        ]
    ];

}