<?php

/*
 * @app Storage
 * @package Storage.model.StockOut
 * @author laofahai@TEam Swift
 * @link https://ng-erp.com
 * */
namespace Storage\Model;
use Common\Model\CommonViewModel;

class StockOutModel extends CommonViewModel {

    protected $viewFields = [
        "StockOut" => ['*', '_type'=>'left'],
        "User" => [
            'login',
            'realname',
            '_on'=>"StockOut.user_id=User.id",
            '_type'=>'left'
        ]
    ];

}