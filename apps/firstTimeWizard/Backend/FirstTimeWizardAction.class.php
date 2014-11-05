<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 14/11/3
 * Time: 22:35
 */

class FirstTimeWizardAction extends CommonAction {

    //标记已忽略popover
    public function insert() {
        $key = trim(I("post.key"));
        $uid = getCurrentUid();
        $map = array(
            "uid" => $uid,
            "node_key" => $key
        );
        $model = D("FirstTimeWizard");
        $exists = $model->where($map)->find();
        if($exists) {
            $model->save(array(
                "id" => $exists["id"],
                "status" => 1
            ));
        } else {
            $model->add(array(
                "uid" => $uid,
                "node_key" => $key,
                "status" => 1
            ));
        }
    }

    public function _filter(&$map) {
        $map["uid"] = getCurrentUid();
    }

} 