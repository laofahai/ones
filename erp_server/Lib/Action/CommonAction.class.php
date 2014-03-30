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
    
    protected $indexModel = null;
    
    protected $user;

    public function __construct() {
        parent::__construct();
        if(!IS_AJAX) {
//            exit("Permission Denied");
        }

        import("@.Workflow.Workflow");
        import("@.ORG.Auth");
        if ($_SERVER["HTTP_SESSIONHASH"]) {
            session_id($_SERVER["HTTP_SESSIONHASH"]);
        }
        
        $this->user = $_SESSION["user"];
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
    protected function success($msg) {
        $this->response(array(
            "error" => 0,
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

        $map = array();
        $this->_filter($map);
        
        $list = $model->where($map)->order("id DESC")->select();
        $this->response($list);
    }
    
    /**
     * 通用REST GET方法
     */
    public function read() {
        if("true" === $_GET["workflow"]) {
            return $this->doWorkflow();
        }
        
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
        $name = $this->getActionName();
        $model = D($name);
        
        /**
         * 对提交数据进行预处理
         */
        $this->pretreatment();
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
    
    /**
     * 更新
     */
    public function update() {
        $name = $this->getActionName();
        $model = D($name);
        /**
         * 对提交数据进行预处理
         */
        $this->pretreatment();
        if (false === $model->create()) {
            $this->error($model->getError());
        }
        // 更新数据
        $result = $model->save();
        if ($result !== false) { //保存成功
            $this->response(array(
                "error" => 0
            ));
        } else {
            //失败提示
            $this->error('更新失败!');
        }
    }
    
    /**
     * 删除
     */
    public function delete() {
        $name = $this->getActionName();
        $model = M($name);
        if (!empty($model)) {
            $pk = $model->getPk();
            $id = $_REQUEST [$pk];
            if (isset($id)) {
                $condition = array($pk => array('in', explode('|', $id)));
                $list = $model->where($condition)->delete();
                if ($list !== false) {
                    $this->success('删除成功！');
                } else {
                    $this->error('删除失败！');
                }
            } else {
                $this->error('非法操作');
            }
        }
    }
    
    /**
     * 执行工作流节点
     */
    protected function doWorkflow() {
        $mainRowid = abs(intval($_GET["id"]));
        $nodeId = abs(intval($_GET["node_id"]));
        if(!$this->workflowAlias or !$mainRowid or !$nodeId) {
           $this->error("not_allowed");
        }
        
        $workflow = new Workflow($this->workflowAlias);
        $rs = $workflow->doNext($mainRowid, $nodeId, false, false);
        if(false === $rs) {
            $this->error("not_allowed");
        }
        // 结束信息返回true、或者没有任何返回值时跳转
        if(true === $rs or !$rs) {
            $this->success();
        }
    }
    
    /**
     * 过滤器
     */
    protected function _filter(&$map) {}
    
    /**
     * 对数据进行预处理
     * 
     */
    protected function pretreatment() {
        switch($this->_method) {
            case "put":
                $_POST = I("put.");
                break;
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
