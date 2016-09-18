<?php

/*
 * @app Finance
 * @package Finance.model.Payables
 * @author laofahai@TEam Swift
 * @link http://ng-erp.com
 * */
namespace Finance\Model;
use Common\Model\CommonViewModel;

class PayablesModel extends CommonViewModel {

    protected $viewFields = [
        "Payables" => ['*', '_type'=>'left'],
        "CommonType" => [
            "name" => "common_type_id_label",
            "_on" => "Payables.common_type_id=CommonType.id",
            "_type" => "left"
        ],
        "Workflow" => [
            "name" => "workflow_id_label",
            "_on" => "Payables.workflow_id=Workflow.id",
            "_type" => "left"
        ],
        "Supplier" => [
            'contacts_company_id',
            '_on' => 'Payables.supplier_id=Supplier.id',
            '_type' => 'left'
        ],
        "ContactsCompany" => [
            'name' => 'supplier_id__label__',
            '_on' => 'Supplier.contacts_company_id=ContactsCompany.id',
            '_type' => 'left'
        ]
    ];

}