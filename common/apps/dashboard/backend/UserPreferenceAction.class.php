<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of MyDesktopAction
 *
 * @author nemo
 */
class UserPreferenceAction extends CommonAction {
    
    public function index() {
        $model = D("UserPreference");
        $preference = $model->get();
        $this->response($preference);
    }
    
    public function insert() {
        $blocks = array();
        
        if(I("post.customize")) {
        	$blocks = I("post.blocks");
        } else {
        	foreach($_POST["blocks"] as $block) {
        		if(!$block["selected"]) {
        			continue;
        		}
        		$blocks[] = array(
        				"name" => $block["name"],
        				"position" => $block["position"],
        				"listorder"=> $block["listorder"]
        		);
        	}
        }
        

        $btns = array();
        foreach($_POST["btns"] as $btn) {
            if(!$btn["selected"]) {
                continue;
            }
            $btns[] = array(
                "name" => $btn["name"],
                "listorder"=> $btn["listorder"]
            );
        }

        $data = array();
        $data["blocks"] = $blocks;
        $data["btns"] = $btns;

        $model = D("UserPreference");
        $model->update($data);
        
    }
    
}
