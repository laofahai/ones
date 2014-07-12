<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 14-7-9
 * Time: 1:29
 */

class AppsModel extends CommonModel {

    private $statusText = array(
        "disabled", "enabled"
    );

    public function select($options=array()) {
        $data = parent::select($options);
        foreach($data as $k=>$v) {
            $data[$k]["status_text"] = $this->statusText[$v["status"]];
        }
        return $data;
    }

} 