<?php

namespace Product\Service;
use Common\Model\CommonTreeModel;

class ProductCategoryService extends CommonTreeModel {

    protected $_auto = [
        ["company_id", "get_current_company_id", 1, "function"]
    ];

}