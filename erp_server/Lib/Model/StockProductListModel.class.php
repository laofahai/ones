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
        if(!$data) {
            return false;
        }
        
        foreach($data as $k=>$v) {
            $fca[] = $v["factory_code_all"];
        }
        $map = array(
            "factory_code_all" => array("IN", implode(",", $fca)),
        );
        $tmp = $this->where($map)->select();
        foreach($tmp as $t) {
            $old[$t["factory_code_all"]."-".$t["stock_id"]] = $t["num"];
        }
        
        foreach($data as $k=>$v) {
//            $tmp = $this->where("factory_code_all='{$v["factory_code_all"]}'")->find();
//            //已存在记录，update
//            if($tmp) {
//                $rs = $this->where("factory_code_all='{$v["factory_code_all"]}'")->setInc("num", $v["num"]);
//            } else {
//                
//            }
//            print_r($v);exit;
            if(array_key_exists($v["factory_code_all"]."-".$v["stock_id"], $old)) {
                $num = $v["num"]+$old[$v["factory_code_all"]."-".$v["stock_id"]];
            } else {
                $num = $v["num"];
            }
            $saveData = array(
                "factory_code_all" => $v["factory_code_all"],
                "goods_id" => $v["goods_id"],
                "stock_id" => $v["stock_id"],
                "color_id" => $v["color_id"],
                "standard_id" => $v["standard_id"],
                "num" => $num
            );
            $rs = $this->add($saveData, array(), true);
//            echo $this->getLastSql();exit;
//            echo 123;exit;
            if(!$rs) {
                return false;
            }
            
//            exit;
        }
        
        return true;
        
    }
    
}

?>
