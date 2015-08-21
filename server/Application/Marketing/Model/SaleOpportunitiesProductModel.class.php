<?php

namespace Marketing\Model;
use Common\Model\CommonViewModel;

class SaleOpportunitiesProductModel extends CommonViewModel {

    protected $viewFields = array(
        "SaleOpportunitiesProduct" => array('*', '_type'=>'left'),
        "Product" => array('name', 'price', 'cost', '_type'=>'left', '_on'=>'Product.id=SaleOpportunitiesProduct.product_id')
    );

}