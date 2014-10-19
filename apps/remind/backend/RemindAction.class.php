<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 14-10-16
 * Time: 0:32
 */

class RemindAction extends CommonAction {

    protected function _filter(&$map) {
        if($_GET["user_id"]) {
            $map["user_id"] = abs(intval($_GET["user_id"]));
        } else {
            $map["user_id"] = -1;
        }

        if(!$_GET["queryAll"]) {
            $map["num"] =  array("GT", 0);
        }
    }

    public function insert() {
        $model = D("Remind");
        $uids = $model->getRemindToUsers($_POST["remindTo"]);
        $model->remindTo($uids, $_POST["msg"], $_POST["type"]);
    }

    public function update() {
        $map = array(
            "id" => abs(intval($_GET["id"])),
            "user_id" => getCurrentUid()
        );
        D("Remind")->where($map)->save(array(
            "num" => 0
        ));
    }


} 