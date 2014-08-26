<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 8/23/14
 * Time: 22:26
 */

class StatisticsBuild extends CommonBuildAction {
    protected $authNodes = array(
        "statistics.sale.read",
        "statistics.overview.read",
        "statistics.productview.read"
    );
} 