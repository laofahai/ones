<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of PurchaseViewModel
 *
 * @author 志鹏
 */
class PurchaseViewModel extends CommonViewModel {
    
    protected $workflowAlias = "purchase";
    
    protected $viewFields = array(
        "Purchase" => array("*", "_type"=>"left"),
        "Types"=> array("name"=>"purchase_type_label", "_on"=>"Purchase.purchase_type=Types.id", "_type"=>"left"),
        "User" => array("truename" => "buyer", "_on" => "Purchase.user_id=User.id", "_type"=>"left"),
        "RelationshipCompany" => array("name"=>"supplier_id_label", "address", "_on"=>"RelationshipCompany.id=Purchase.supplier_id", "_type"=>"left"),
    );

    public $searchFields = array(
        "bill_id", "User.truename", "RelationshipCompany.name", "Types.name"
    );
    
}

?>
