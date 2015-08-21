<?php

/*
 * @app Productattribute
 * @package Productattribute.model.ProductAttributeContent
 * @author laofahai@TEam Swift
 * @link https://ng-erp.com
 * */
namespace Productattribute\Model;
use Common\Model\CommonViewModel;

class ProductAttributeContentModel extends CommonViewModel {

    protected $viewFields = array(
        "ProductAttributeContent" => array('*', '_type'=>'left'),
        "Product" => [
            "name" => "product_name",
            "_on" => "Product.id=ProductAttributeContent.product_id",
            "_type" => "left"
        ],
        "ProductAttribute" => [
            "name" => "product_attribute_name",
            "_on" => "ProductAttribute.id=ProductAttributeContent.product_attribute_id",
            "_type" => "left"
        ]
    );

    public $fuzzy_search = ['content'];

}