<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of MakeShipment
 *
 * @author 志鹏
 * 
 * 生成发货单。收件人信息，发件人信息，产品信息，发货方式，stockout_id
 */
class StockoutMakeExpress extends WorkflowAbstract {
    
    private $manInfo = array(
        "Orders" => array(
            "FromForeign" => "saler_id",
            "FromModel"   => "User",
            "ToLinkmanForeign"   => "customer_linkman_id",
            "ToLinkmanModel" => "CustomerLinkman",
            "ToForeign" => "customer_id",
            "ToModel" => "Customer"
        )
    );
    
    private $manFields = array();
    
    public function run() {
        
        if(IS_POST) {
//            print_r($_POST);exit;
            $shipmentModel = D("Express");
            $_POST["stockout_id"] = $this->mainrowId;
            $lastId = $shipmentModel->add($_POST);

            if(!$lastId) {
                return;
               //@todo 
            }
            $stockModel = D("StockOut");
            $stockModel->where("id=".$this->mainrowId)->save(array(
                "express_id" => $lastId
            ));
            
            return;
        }
        
//        $manInfo = $this->manInfo[$this->context["sourceModel"]];
//        //源信息，用于获取发/收货人信息
//        $sourceModel = D($this->context["sourceModel"]);
//        $sourceRow = $sourceModel->find($this->context["sourceId"]);
//        
//        $fromModel = D($manInfo["FromModel"]);
//        $from = $fromModel->find($sourceRow[$manInfo["FromForeign"]]);
////        echo $fromModel->getLastSql();exit;
//        $toModel = D($manInfo["ToModel"]);
//        $to = $toModel->find($sourceRow[$manInfo["ToForeign"]]);
//        if($manInfo["ToLinkmanForeign"]) {
//            $toModel = D($manInfo["ToLinkmanModel"]);
//            $toLinkman = $toModel->find($sourceRow[$manInfo["ToLinkmanForeign"]]);
//            $to = array_merge($to, $toLinkman);
//        }
//        
//        $paperInfo["from_name"] = $from["truename"];
//        $paperInfo["from_company"] = DBC("company_name");
//        $paperInfo["from_address"] = DBC("company_address");
//        $paperInfo["from_phone"] = $from["phone"];
//        
//        $paperInfo["to_name"] = $to["contact"];
//        $paperInfo["to_company"] = $to["name"];
//        $paperInfo["to_address"] = $to["address"];
//        $paperInfo["to_phone"] = $to["phone1"];
//        
//        $paperInfo["total_num"] = $sourceRow["total_num"];
//        
//        $paperInfo["stockout_id"] = $this->mainrowId;
        
        $data = array(
            "type" => "redirect",
            "location" => sprintf("/doWorkflow/shipment/makeExpress/%d/%d", $this->currentNode["id"], $this->mainrowId)
        );
        $this->response($data);
        
//        $this->view->assign("FormHTML", toForm("Shipment", "", false, $paperInfo));
//        $this->view->display("../Common/Workflow/Stockout/makeShipment");
//
//        return "wait";
    }
    
}
