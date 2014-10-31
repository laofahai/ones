<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 14-10-16
 * Time: 11:06
 */

class RemindModel extends CommonModel {

    public function getRemindToUsers($data) {
        $uids = array();
        if($data["user"]) {
            foreach($data["user"] as $u) {
                $uids[$u] = $u;
            }
        }

        if($data["userGroup"]) {
            $model = D("AuthGroupAccess");
            $tmp = $model->where(array(
                "group_id" => array("IN", $data["userGroup"])
            ))->select();
            foreach($tmp as $t) {
                $uids[$t["uid"]] = $t["uid"];
            }
        }

        if($data["department"]) {
            $model = D("Department");
            $users = $model->getUsers($data["department"]);
            foreach($users as $u) {
                $uids[$u["id"]] = $u["id"];
            }
        }
        return $uids;
    }

    public function remindTo($uids, $msg, $type) {
        if(!$uids) {
            return;
        }

        foreach($uids as $u) {
            $map = array(
                "user_id" => $u,
                "type"    => $type
            );

            $tmp = $this->where($map)->find();
            if($tmp) {
                $this->where($map)->setInc("num");
            } else {
                $this->add(array(
                    "user_id" => $u,
                    "type"    => $type,
                    "content" => $msg,
                    "num"     => 1
                ));
            }
        }
    }

} 