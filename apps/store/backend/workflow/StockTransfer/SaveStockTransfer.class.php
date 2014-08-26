<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of StockTransferSaveStockTransfer
 *
 * @author 志鹏
 */
class StockTransferSaveStockTransfer extends WorkflowAbstract {
    
    public function run() {
        $this->updateStatus("StockTransfer", $this->mainrowId, 1);
    }
    
}
