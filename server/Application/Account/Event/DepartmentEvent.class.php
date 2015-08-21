<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 5/31/15
 * Time: 20:51
 */

namespace Account\Event;


use Common\Event\BaseRestEvent;

class DepartmentEvent extends BaseRestEvent {

    /*
     * @override
     * */
    public function on_list() {

        $model = D('Department');
        $tree = $model->get_tree();

        $this->response($tree, $model);

    }

}