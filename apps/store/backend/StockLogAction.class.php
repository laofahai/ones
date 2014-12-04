<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 14/12/1
 * Time: 08:58
 */

class StockLogAction extends CommonAction {

    protected $dataModelAlias = "product";

    protected $indexModel = "StockLogView";

    protected function _filter(&$map) {
        if($_GET["source_id"]) {
            $map["source_id"] = abs(intval($_GET["source_id"]));
        }
        if($_GET["type"]) {
            $map["type"] = $_GET["type"] > 1 ? 2 : 1;
        }
        if($_GET["batch"] && $_GET["batch"] !== "all") {
            $map["dateline"] = $_GET["batch"];
        }
    }

    public function index() {
        $data = parent::index(true);
        if($_GET["mergeSameRows"] && $_GET["batch"] === "all") {
            $tmp = array();
            foreach($data as $row) {
                $k = $row["factory_code_all"]."|".$row["repository_id"];
                if(!$tmp[$k]) {
                    $tmp[$k] = $row;
                    $tmp[$k]["stocks"][] = $row["stock_name"];
                } else {
                    $tmp[$k]["num"] += $row["num"];
                    if(!in_array($row["stock_name"], $tmp[$k]["stocks"])) {
                        $tmp[$k]["stocks"][] = $row["stock_name"];
                    }
                }
            }

            foreach($tmp as $k=>$v) {
                $tmp[$k]["stock_name"] = implode(",", $v["stocks"]);
                unset($tmp[$k]["stocks"]);
            }


            $this->response(reIndex($tmp));

        } else {
            $this->response($data);
        }
    }

} 