<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 10/23/15
 * Time: 17:14
 */

namespace Currency\Service;


use Common\Model\CommonModel;

class CurrencyService extends CommonModel {

    static protected $all_currencies = [
        [
            "name" => "CNY",
            "symbol" => "￥"
        ],
        [
            "name" => "USD",
            "symbol" => "$"
        ],
        [
            "name" => "HKD",
            "symbol" => "HK$"
        ]
    ];

    /*
     * 获得所有可用币种
     * @param string $base 本位币
     * */
    public function get_currency_list() {
        return self::$all_currencies;
    }

}