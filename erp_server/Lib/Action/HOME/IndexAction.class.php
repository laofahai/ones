<?php

class IndexAction extends CommonAction {
    
    public function index(){
//        print_r($_SERVER);exit;
        $data = array(
            array(
                "id" => "1",
                "title" => "the title 1"
            ),
            array(
                "id" => "2",
                "title" => "the title 2"
            ),
        );
        $this->response($data);
    }
    
    public function doLogin() {
        print_r($_REQUEST);
        print_r($_POST);
    }
    
}