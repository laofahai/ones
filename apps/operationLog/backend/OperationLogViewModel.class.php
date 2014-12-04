<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 14/11/30
 * Time: 00:07
 */

class OperationLogViewModel extends CommonViewModel {

    protected $viewFields = array(
        "OperationLog" => array("*", "_type"=>"left"),
        "User" => array("truename", "_on"=>"OperationLog.uid=User.id", "_type"=>"left")
    );

    public function select($options=array()) {
        $data = parent::select($options);

        foreach($data as $k=>$v) {
            $l = lang(sprintf("_links.%s.detail", $v["source_model"]));
            if($l) {
                $data[$k]["link"] = $l;
            }
        }

        return $data;

    }

} 