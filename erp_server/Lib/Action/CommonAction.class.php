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
        
        if(!IS_AJAX) {
//            exit("Permission Denied");
        }

        import("@.ORG.Auth");

        if ($_REQUEST["sessionHash"]) {
            session_id($_GET["sessionhash"]);
        }
    }

    protected function isLogin() {
        return $_SESSION["user"]["id"] ? 1 : 0;
    }
    
    protected function loginRequired() {
        if (!$this->isLogin() and !in_array(MODULE_NAME . "." . ACTION_NAME, C("AUTH_CONFIG.AUTH_DONT_NEED"))) {
            header('HTTP/1.1 401 Unauthorized');
        }
    }
    
    /**
     * 权限预检测
     */
    private function checkPermission(){
        
        $this->loginRequired();
        
        import('ORG.Util.Auth');//加载类库
        $auth=new Auth();
        $action = ACTION_NAME;
        $action = ACTION_NAME == "insert" ? "add" : $action;
        $action = ACTION_NAME == "update" ? "edit" : $action;
        $rule = sprintf("%s.%s.%s", GROUP_NAME, MODULE_NAME, $action);
        if($action == "doWorkflow") {
            return true;
        }
//        echo $rule;exit;
        if(!$auth->check($rule, $_SESSION["user"]["id"])){
            $this->error(L("Login_Required"));
        }
    }
    
    /**
     * 通用返回错误方法
     * @param $msg string
     */
    protected function error($msg) {
        $this->response(array(
            "error" => 1,
            "msg"   => $msg
        ));
        exit;
    }
    
    /**
     * 
     * 通用REST列表返回 
     **/
    public function index() {
        $name = $this->indexModel ? $this->indexModel : $this->getActionName();
        $model = D($name);
        if (empty($model)) {
            $this->error(L("Server error"));
        }
        
        $list = $model->where($map)->order("id DESC")->select();
        $this->response($list);
    }
    
    /**
     * 通用REST GET方法
     */
    public function read() {
        $name = $this->readModel ? $this->readModel : $this->getActionName();
        $model = D($name);
        if($this->relation) {
            $model = $model->relation(true);
        }
        $id = $_GET["id"];
        $this->response($model->find($id));
    }

    /**
     * 通用REST插入方法
     */
    public function insert() {
//        $this->testResponse();
        $name = $this->getActionName();
        $model = D($name);

        if (false === $model->create()) {
            $this->error($model->getError());
        }
        if ($this->relation) {
            $model = $model->relation(true);
        }
        $result = $model->add();

        if ($result !== false) { //保存成功
            $this->response(array(
                "error" => 0,
                "id" => $result
            ));
        } else {
            //失败提示
            $this->error('新增失败!');
        }
    }

    
    private function testResponse() {
        $this->response(array(
            "error" => 1,
            "id" => 1,
            "msg"=> "错误"
        ));
    }
}
