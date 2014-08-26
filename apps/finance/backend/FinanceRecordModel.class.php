<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of FinanceRecordModel
 *
 * @author 志鹏
 */
class FinanceRecordModel extends CommonModel {
    
    /**
     * 修改账户余额
     * @param $method 1:注入|2:抽取
     */
    public function changeBalance($accountId, $amount, $method="1") {
        $method = $method == 1 ? "SetInc" : "SetDec";
        $account = D("FinanceAccount");
        $rs = $account->where("id=".$accountId)->$method("balance", $amount);
//        echo $account->getLastSql();
//        var_dump($rs);exit;
        return $rs;
    }
    
    public function addRecord($data) {
        $this->startTrans();
        $data["status"] = 1;
        $data["dateline"] = CTS;
        $data["user_id"] = getCurrentUid();
        $lastId = $this->add($data);
        if($lastId) {
            $rs = $this->changeBalance($data["account_id"], $data["amount"], $data["type"]);
        }
        
        if(!$lastId or !$rs) {
            Log::write("SQL Error:".$this->getLastSql(), Log::SQL);
            $this->rollback();
            return false;
        }
        
        $this->where("id=".$lastId)->save(array(
            "status" => 1,
            "financer_id" => getCurrentUid()
        ));
        $this->commit();
        return $lastId;
    }
    
    public function delRecord($id) {
        
        $record = $this->find($id);
        if($record["status"] == 0) {
            $this->where("id=".$id)->delete();
        }
        
        $this->startTrans();
        $method = $record["type"] == 1 ? 2 : 1;
        $rs = $this->changeBalance($record["account_id"], $record['amount'], $method);
        if(!$rs) {
            Log::write("SQL Error:".$this->getLastSql(), Log::SQL);
            $this->rollback();
            return false;
        }
        $this->commit();
    }
    
    
    
}
