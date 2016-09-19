<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 5/19/15
 * Time: 20:55
 */

namespace Product\Event;
use Common\Event\BaseRestEvent;

class ProductCategoryEvent extends BaseRestEvent {

    public function on_event_list() {
        $model = D('Product/ProductCategory', "Service");
        $tree = $model->get_tree();

        $this->response($tree);
    }

}