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
        D("FirstTimeWizard")->add(array(
            "uid" => getCurrentUid(),
            "node_key" => $key,
            "status" => 1
        ));
    }

    public function _filter(&$map) {
        $map["uid"] = getCurrentUid();
    }

} 