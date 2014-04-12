<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of StockoutAction
 *
 * @author nemo
 */
class StockoutAction extends CommonAction {
    
    protected $workflowAlias = "stockout";
    
    protected $indexModel = "StockoutOrdersView";
    
}
