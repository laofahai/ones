<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of CommonAction
 *
 * @author Administrator
 */
class CommonAction extends RestAction {
    
    public function __construct() {
        parent::__construct();
        
        if($_REQUEST["sessionHash"]) {
            session_id($_GET["sessionhash"]);
        }
        
    }
    
    
    /**
     * 分页
     */
    public function getQueryLimit($total, $page=1, $perPage=25) {
        return array(
            ($page-1)*$perPage,
            ceil($total/$perPage)
        );
    }
    
    
}
