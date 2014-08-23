<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 8/23/14
 * Time: 16:36
 */

class GoodsBuild extends CommonBuildAction {

    protected $authNodes = array(
        "goods.goods.*",
        "goods.goodscategory.*"
    );

} 