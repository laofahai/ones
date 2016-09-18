<?php

/*
 * @app Purchase
 * @package Purchase.model.Purchase
 * @author laofahai@TEam Swift
 * @link http://ng-erp.com
 * */
namespace Purchase\Model;
use Common\Model\CommonViewModel;

class PurchaseModel extends CommonViewModel {

    protected $viewFields = [
        "Purchase" => ['*', '_type'=>'left'],
        "Supplier" => [
            'contacts_company_id',
            '_on' => 'Purchase.supplier_id=Supplier.id',
            '_type' => 'left'
        ],
        "ContactsCompany" => [
            'name' => 'supplier_id__label__',
            '_on' => 'Supplier.contacts_company_id=ContactsCompany.id',
            '_type' => 'left'
        ],
        "Workflow" => [
            'name' => 'workflow_id__label__',
            '_on' => 'Purchase.workflow_id=Workflow.id',
            '_type' => 'left'
        ]
    ];

    public $fuzzy_search = [
        'Purchase.bill_no', 'Purchase.subject',
        'ContactsCompany.name'
    ];


}