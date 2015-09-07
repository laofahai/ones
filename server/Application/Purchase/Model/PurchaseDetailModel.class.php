<?php

/*
 * @app Purchase
 * @package Purchase.model.PurchaseDetail
 * @author laofahai@TEam Swift
 * @link https://ng-erp.com
 * */
namespace Purchase\Model;
use Common\Model\CommonViewModel;

class PurchaseDetailModel extends CommonViewModel {

    protected $viewFields = [
        "PurchaseDetail" => ['*', '_type'=>'left'],
        'Product' => [
            'name'=>'product_id__label__',
            'measure_unit',
            'measure_unit' => 'quantity__after__',
            '_on' => 'Product.id=PurchaseDetail.product_id',
            '_type' => 'left'
        ],
        "Supplier" => [
            '_on' => 'Supplier.id=PurchaseDetail.supplier_id',
            '_type' => 'left'
        ],
        "ContactsCompany" => [
            'name' => 'supplier_id__label__',
            '_on' => 'ContactsCompany.id=Supplier.contacts_company_id',
            '_type' => 'left'
        ]
    ];

}