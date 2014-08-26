<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of GoodsCraftViewModel
 *
 * @author nemo
 */
class GoodsCraftViewModel extends CommonViewModel {
    
    protected $viewFields = array(
        "GoodsCraft" => array("*"),
        "Craft" => array("name", "memo", "id", "_on"=>"Craft.id=GoodsCraft.craft_id")
    );
    
}
