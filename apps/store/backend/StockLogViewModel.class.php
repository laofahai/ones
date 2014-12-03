<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 14/12/1
 * Time: 08:42
 */

class StockLogViewModel extends CommonViewModel {

    public $viewFields = array(
        "StockLog" => array("*", "_type"=>"left"),
        "User" => array("truename"=>"operationMan", "_on"=>"StockLog.user_id=User.id", "_type"=>"left"),
        "Stock"=> array("name"=>"stock_name", "_on"=>"StockLog.repository_id=Stock.id", "_type"=>"left"),
        "Goods"=> array("name"=>"goods_name", "_on"=>"StockLog.goods_id=Goods.id", "_type"=>"left")
    );

    public $searchFields = array(
        "User.truename", "Stock.name", "Goods.name"
    );

    public function __construct() {
        if($_GET["type"] > 1) {
            $this->viewFields["StockoutDetail"] = array("num"=>"total_num", "_on"=>"StockLog.factory_code_all=StockoutDetail.factory_code_all AND StockLog.source_id=StockoutDetail.stockout_id", "_type"=>"left");
        } else {
            $this->viewFields["StockinDetail"] = array("num"=>"total_num", "_on"=>"StockLog.factory_code_all=StockinDetail.factory_code_all AND StockLog.source_id=StockinDetail.stockin_id", "_type"=>"left");
        }
        parent::__construct();
    }

    public function select($options=array()) {
        $data = parent::select($options);
        foreach($data as $k=>$v) {
            $data[$k]["dateline_label"] = date("Y-m-d H:i", $v["dateline"]);
            $data[$k]["stock_direction"] = $v["type"] > 1 ? "-" : "+";
        }

        return $data;
    }


} 