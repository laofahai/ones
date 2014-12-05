<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of ProducePlanViewModel
 *
 * @author nemo
 */
class ProducePlanViewModel extends CommonViewModel {
    
    public $workflowAlias = "producePlan";
    
    public $viewFields = array(
        "ProducePlan"=> array("*", "_type"=>"left"),
        "Types" => array("name"=>"type_label", "_on"=>"ProducePlan.type=Types.id", "_type"=>"left")
    );

    public $searchFields = array(
        "bill_id"
    );
}
