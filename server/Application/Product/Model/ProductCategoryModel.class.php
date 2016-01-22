<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 6/1/15
 * Time: 22:53
 */

namespace Product\Model;

use Common\Model\CommonTreeModel;

class ProductCategoryModel extends CommonTreeModel {

    protected $viewFields = [
        "ProductCategory" => ['*', '_type'=>'left']
    ];

}