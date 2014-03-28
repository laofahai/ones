<?php

/**
 * @filename MakeStockinPaper.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-11-30  14:08:05
 * @Description
 * 
 */
class ReturnsMakeStockinPaper extends WorkflowAbstract {
    
    public function run() {
        $returns = D("Returns");
        $theReturns = $returns->find($this->mainrowId);
        $returnDetail = D("ReturnsDetail");
        $theReturnsDetail = $returnDetail->where("returns_id=".$theReturns["id"])->select();
        
//        $returns->startTrans();
        $data = array(
            "subject" => $theReturns["subject"],
            "dateline"=> CTS,
            "total_num" => $theReturns["total_num"],
            "status"  => 1,
            "user_id" => getCurrentUid(),
            "source_model" => "Returns",
            "source_id"    => $this->mainrowId,
            "stock_manager"=> 0,
            "stock_id"     => $theReturns["stock_id"],
            "memo" => $theReturns["memo"]
        );
        
        $stockin = D("Stockin");
        $stockinDetail = D("StockinDetail");
        
        $lastId = $stockin->add($data);
//        echo $lastId;exit;
//        var_dump($theReturnsDetail);exit;
        foreach($theReturnsDetail as $trd) {
            $data = array(
                "stockin_id" => $lastId,
                "goods_id"   => $trd["goods_id"],
                "color_id"   => $trd["color_id"],
                "standard_id"=> $trd["standard_id"],
                "num"        => $trd["num"],
                "factory_code_all" => $trd["factory_code_all"]
            );
//            print_r($data);exit;
            $stockinDetail->add($data);
            
        }
        
        //新建入库流程
        import("@.Workflow.Workflow");
        $workflow = new Workflow("stockin", $this->action);
        $rs = $workflow->doNext($lastId, "", true, true); //新建
//        $rs = $workflow->doNext($lastId, "", true, true); //保存
//        $rs = $workflow->doNext($lastId, "", true, true); //提交确认
//        var_dump($rs);exit;
        return true;
//        exit;
    }
    
}

?>
