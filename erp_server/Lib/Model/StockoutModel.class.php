<?php

/**
 * @filename StockoutModel.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-11-17  17:15:22
 * @Description
 * 
 */
class StockoutModel extends CommonModel {
    
    protected $workflowAlias = "stockout";
    
    protected $_auto = array(
        array("status", 0),
        array("datelie", CTS),
        array("stock_manager", 0)
    );
    
    public function makeStockoutPaper($sourceModelName, $sourceId, $sourceUidField="saler_id", $sourceDetailForeignKey="", $sourceStockIdFeild="stock_id") {
        $sourceDetailForeignKey = $sourceDetailForeignKey ? $sourceDetailForeignKey : strtolower($sourceModel)."_id";
        $sourceModel = D($sourceModelName);
        $source = $sourceModel->find($sourceId);
        
        if(!$source) {
            return false;
        }
        $data = array(
            "source_id" => $sourceId,
            "source_model" => $sourceModelName,
            "stock_id" => $source[$sourceStockIdFeild],
            "total_num"=> $source["total_num"],
            "subject"  => $source["subject"],
            "dateline" => CTS,
            "source_user_id" => $source[$sourceUidField]
        );
        $this->startTrans();
        
        $stockoutId = $this->add($data);
//        echo $this->getLastSql();exit;
//        echo $stockoutId;exit;
        $stockoutDetail = D("StockoutDetail");
        $sourceDetail = D($sourceModelName."Detail");
        $details = $sourceDetail->where($sourceDetailForeignKey."=".$sourceId)->select();
//        echo $sourceDetail->getLastSql();exit;
        if(!$details) {
            //@todo
            return false;
        }
        foreach($details as $d) {
            $data = array(
//                "source_id" => $sourceId,
                "stockout_id" => $stockoutId,
                "source_row_id" => $d["id"]
            );
            $rs = $stockoutDetail->add($data);
            if(!$rs) {
                $this->rollBack();
                break;
            }
        }
        
        if(!$stockoutId) {
            $this->rollBack();
            return false;
        } else {
            $this->commit();
        }
        
        return $stockoutId;
    }
    
}

?>
