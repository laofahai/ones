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

    public function __construct() {
        if($_GET["type"] > 1) {
            $this->viewFields["StockoutDetail"] = array("num"=>"total_num", "_on"=>"StockLog.factory_code_all=StockoutDetail.factory_code_all AND StockLog.source_id=StockoutDetail.stockout_id", "_type"=>"left");
        } else {
            $this->viewFields["StockoutDetail"] = array("num"=>"total_num", "_on"=>"StockLog.factory_code_all=StockinDetail.factory_code_all AND StockLog.source_id=StockinDetail.stockin_id", "_type"=>"left");
        }
        parent::__construct();
    }

    public function select($options=array()) {
        $data = parent::select($options);
        foreach($data as $k=>$v) {
            $data[$k]["dateline_label"] = date("Y-m-d H:i", $v["dateline"]);
        }

        return $data;
    }

    /*
     * $options = array(
     *  type => 1进2出
     *  source_id => 原始单据ID
     *  factory_code_all => 编码
     *  user_id => 操作员ID
     *  repository_id => 仓库ID
     *  dateline => 时间
     * );
     * **/
    public function record($options) {
        $needed = array(
            "type", "source_id", "factory_code_all", "repository_id", "num"
        );

        foreach($needed as $need) {
            if(!array_key_exists($need, $options)) {
                return false;
            }
        }

        $options["user_id"] = $options["user_id"] ? $options["user_id"] : getCurrentUid();
        $options["dateline"] = $options["dateline"] ? $options["dateline"] : CTS;

        $this->add($options);

    }

} 