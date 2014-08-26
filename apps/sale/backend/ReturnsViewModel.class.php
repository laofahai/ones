<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of ReturnsViewModel
 *
 * @author 志鹏
 */
class ReturnsViewModel extends CommonViewModel {
    
    protected $workflowAlias = "returns";
    
    protected $viewFields = array(
        "Returns" => array("*", "_type"=>"left"),
        "Types"   => array("name"=>"returns_type_label", "_on"=>"Returns.returns_type=Types.id", "_type"=>"left"),
        "User"    => array("truename"=>"saler", "_on"=>"User.id=Returns.saler_id", "_type"=>"left"),
        "RelationshipCompany" => array("name"=>"customer", "_on"=>"RelationshipCompany.id=Returns.customer_id", "_type"=>"left")
    );

    public $searchFields = array(
        "bill_id", "Types.name", "User.truename", "RelationshipCompany"
    );
}
?>
