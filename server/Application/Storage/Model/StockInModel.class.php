<?php

namespace Storage\Model;
use Common\Model\CommonViewModel;

class StockInModel extends CommonViewModel {

    protected $viewFields = array(
        "StockIn" => array('*', '_type'=>'left')
    );

}