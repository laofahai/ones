<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 14/11/30
 * Time: 15:15
 */

class UserPreferenceModel extends Model {

    public function get($uid=0) {
        $uid = $uid ? $uid : getCurrentUid();
        $data = $this->where("uid=".$uid)->getField("data");
        $data = json_decode($data, true);

        if(!$data){
            return array();
        }

        $data["blocks"] = multi_array_sort($data["blocks"], "listorder", SORT_ASC);

        $data["btns"] = multi_array_sort($data["btns"], "listorder", SORT_ASC);

        return $data;

    }

    public function update($data) {

        $old = $this->get();

        $data = array_merge((array)$old, $data);

        $this->add(array(
            "uid" => getCurrentUid(),
            "data"=> json_encode($data)
        ), null, true);
    }

} 