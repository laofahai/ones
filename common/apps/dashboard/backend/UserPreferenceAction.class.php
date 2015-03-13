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

        $model = D("UserPreference");
        $model->update(I("post."));
        
    }
    
}
