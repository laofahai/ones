<?php

/**
 * Created by PhpStorm.
 * User: laofahai
 * Date: 16/7/25
 * Time: 22:05
 */

namespace Account\Model;


use Common\Model\CommonViewModel;

class CompanyModel extends CommonViewModel {

    protected $viewFields = [
        'Company' => ['*']
    ];

    public $not_belongs_to_company = true;
    
}