<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 7/29/15
 * Time: 08:48
 */

namespace Productattribute\Model;


use Common\Model\CommonViewModel;

class ProductAttributeMapModel extends CommonViewModel {

    protected $viewFields = [
        'ProductAttributeMap' => ['*', '_type'=>'left'],
        'ProductAttribute' => [
            'alias' => 'attribute_field',
            '_on' => 'ProductAttributeMap.product_attribute_id=ProductAttribute.id',
            '_type' => 'left'
        ],
        'ProductAttributeContent' => [
            'content',
            '_on' => 'ProductAttributeMap.product_attribute_content_id=ProductAttributeContent.id',
            '_type' => 'left'
        ]
    ];

}