<?php

/*
 * @app Productattribute
 * @package Productattribute.model.ProductAttribute
 * @author laofahai@TEam Swift
 * @link http://ng-erp.com
 * */
namespace Productattribute\Model;
use Common\Model\CommonViewModel;

class ProductAttributeModel extends CommonViewModel {

    protected $viewFields = array(
        "ProductAttribute" => array('*', '_type'=>'left')
    );

}