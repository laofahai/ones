<?php

namespace Storage\Model;
use Common\Model\CommonViewModel;

class StorageModel extends CommonViewModel {

    protected $viewFields = array(
        "Storage" => array('*', '_type'=>'left')
    );

}