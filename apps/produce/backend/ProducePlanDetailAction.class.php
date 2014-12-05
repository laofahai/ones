<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of ProducePlanDetailAction
 *
 * @author nemo
 */
class ProducePlanDetailAction extends CommonAction {
    
    protected $indexModel = "ProducePlanDetailView";

    protected function _filter(&$map) {
        if($_GET["plan_id"]) {
            $map["plan_id"] = abs(intval($_GET["plan_id"]));
        }
    }
    

}
