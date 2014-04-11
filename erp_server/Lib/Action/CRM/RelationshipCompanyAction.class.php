<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of RelationshipCompanyAction
 *
 * @author nemo
 */
class RelationshipCompanyAction extends CommonAction {
    
    protected $relation = true;
    
    public function _filter(&$map) {
        if($_GET["typeahead"]) {
            $this->relation = false;
            $map["_string"] = str_replace("__", strtoupper($_GET["typeahead"]), "name LIKE '%__%' OR pinyin LIKE '%__%'");
        }
    }
    
    public function index() {
        $data = parent::index(true);
        foreach($data as $k=>$v) {
            $data[$k]["name"] = $v["name"].sprintf('<span>%s</span>', $v["pinyin"]);
        }
        
        $this->response($data);
    }
    
}
