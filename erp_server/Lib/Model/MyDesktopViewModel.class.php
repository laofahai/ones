<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of MyDesktopModel
 *
 * @author nemo
 */
class MyDesktopViewModel extends CommonViewModel {
    
    protected $viewFields = array(
        "MyDesktop"=>array("*","_type"=>"left"),
        "UserDesktop"=> array("name","template","width", "_on"=>"UserDesktop.id=MyDesktop.desk_id", "_type"=>"left")
    );
    
    
}
