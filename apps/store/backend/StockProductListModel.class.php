<?php

/**
 * @filename StockProductListModel.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-11-13  18:41:52
 * @Description
 * 
 */
class StockProductListModel extends Model {
    
    
    /**
     * 更新库存
     */
    public function updateStoreList($data) {
//        print_r($data);exit;
//        var_dump($data);exit;
        if(!$data) {
            $this->error = "no_data";
            return false;
        }
        
        foreach($data as $k=>$v) {
            $fca[] = $v["factory_code_all"];
            $goodsIds[$v["goods_id"]] = $v["goods_id"];
        }
        $map = array(
            "factory_code_all" => array("IN", implode(",", $fca)),
        );
        $tmp = $this->field("factory_code_all,stock_id,num,unit_price,cost")->where($map)->select();
        $exists = array();
        foreach($tmp as $t) {
            $exists[$t["factory_code_all"]."-".$t["stock_id"]]["num"] = $t["num"];
            $exists[$t["factory_code_all"]."-".$t["stock_id"]]["price"] = $t["unit_price"];
            $exists[$t["factory_code_all"]."-".$t["stock_id"]]["cost"] = $t["cost"];
        }

        //商品数据
        $goodsModel = D("Goods");
        $tmp = $goodsModel->where(array(
            "id" => array("IN", implode(",", $goodsIds))
        ))->select();
        foreach($tmp as $v) {
            $goodsInfo[$v["id"]] = $v;
        }

        /**
         * 数据预处理，合并相同项目
         */
        $cleanData = array();
        foreach($data as $k=>$v) {
            if(array_key_exists($v["factory_code_all"], $cleanData)) {
                $cleanData[$v["factory_code_all"]]["num"] += $v["num"];
            } else {
                $cleanData[$v["factory_code_all"]] = $v;
            }
        }

        foreach($cleanData as $k=>$v) {
            //已存在记录
            if(array_key_exists($v["factory_code_all"]."-".$v["stock_id"], $exists)) {
                $num = $v["num"]+$exists[$v["factory_code_all"]."-".$v["stock_id"]]["num"];
                $unitPrice = $exists[$v["factory_code_all"]."-".$v["stock_id"]]["price"];
                $cost = $exists[$v["factory_code_all"]."-".$v["stock_id"]]["cost"];
            } else {
                $num = $v["num"];
                $unitPrice = $v["price"] ? $v["price"] : $goodsInfo[$v["goods_id"]]["price"];
                $cost = $v["cost"] ? $v["cost"] : $goodsInfo[$v["goods_id"]]["cost"];
            }
            
            $saveData = array(
                "factory_code_all" => $v["factory_code_all"],
                "goods_id" => $v["goods_id"],
                "stock_id" => $v["stock_id"],
                "color_id" => $v["color_id"],
                "standard_id" => $v["standard_id"],
                "num" => $num,
                "unit_price" => $unitPrice ? $unitPrice : 0,
                "cost" => $cost ? $cost : 0
            );

            if(!array_key_exists($v["factory_code_all"]."-".$v["stock_id"], $exists)) {
                $saveData["store_min"] = $v["store_min"];
                $saveData["store_max"] = $v["store_max"];
            }

            $rs = $this->add($saveData, array(), true);

            if(!$rs) {
                Log::write($this->getLastSql(), Log::SQL);
                return false;
            }
            
        }

        return true;
        
    }
    
}

?>
