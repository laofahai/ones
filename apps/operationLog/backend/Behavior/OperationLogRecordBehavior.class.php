<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 14/11/30
 * Time: 00:13
 */

class OperationLogRecordBehavior extends Behavior {

    /*
     * @params :
     *  uid || current uid
     *  alias
     *  action
     *  source_model
     *  source_id
     * **/
    public function run(&$params) {

        $model = D("OperationLog");

        if(!$params["uid"]) {
            $params["uid"] = getCurrentUid();
        }

        $params["dateline"] = CTS;

        $model->add($params);

    }

} 