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
        
        $_POST = json_decode(file_get_contents('php://input'), true);
        
        import("@.Workflow.Workflow");
        import("@.ORG.Auth");
//        session(array());
        if ($_SERVER["HTTP_SESSIONHASH"]) {

            $isSameDomain = false;
            $tmp = sprintf("http://%s", $_SERVER["SERVER_NAME"]);

            if(substr($_SERVER["HTTP_REFERER"], 0, strlen($tmp)) == $tmp) {
                $isSameDomain = true;
            }
            if(!$isSameDomain) {
                session_destroy();
            }
            session_id($_SERVER["HTTP_SESSIONHASH"]);
            session_start();
        }
        
        $this->user = $_SESSION["user"];
        
//        if(!$_REQUEST) {
            
//        }
        
        $this->checkPermission();
    }

    protected function isLogin() {
        return $_SESSION["user"]["id"] ? 1 : 0;
    }
    
    protected function loginRequired() {
//        var_dump($_SESSION);
//        var_dump($this->isLogin());exit;
        if (!$this->isLogin() and 
                !in_array(sprintf("%s.%s.%s", GROUP_NAME, MODULE_NAME, ACTION_NAME), 
                        C("AUTH_CONFIG.AUTH_DONT_NEED"))) {
            $this->httpError(401);
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
        $action = ACTION_NAME == "index" ? "read" : $action;
        
        $rule = sprintf("%s.%s.%s", GROUP_NAME, MODULE_NAME, $action);
        if($action == "doWorkflow") {
            return true;
        }
//        echo sprintf("%s.%s.%s", GROUP_NAME, MODULE_NAME, ACTION_NAME);exit;
        $path = sprintf("%s.%s.%s", GROUP_NAME, MODULE_NAME, ACTION_NAME);
        if(!$auth->check($rule, $_SESSION["user"]["id"]) and 
                !in_array($path, 
                        C("AUTH_CONFIG.AUTH_DONT_NEED"))){
            $this->error("Permission Denied:".$path);
            exit;
//            $this->loginRequired();
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
    }
    protected function httpError($code, $msg) {
        send_http_status($code);
        exit;
    }
    protected function success($msg) {
        $this->response(array(
            "error" => 0,
            "msg"   => $msg
        ));
    }
    
    /**
     * 
     * 通用REST列表返回 
     **/
    public function index($return=false) {
        if(method_exists($this, "_before_index")){
            $this->_before_index();
        }
        $name = $this->indexModel ? $this->indexModel : $this->getActionName();
        $model = D($name);
        
        /**
         * 查看是否在fields列表中
         */
//        var_dump($model->getDbFields());
        
        if (empty($model)) {
            $this->error(L("Server error"));
        }
        
        if($this->relation) {
            $model = $model->relation(true);
        }

//        $map = array(
//            "deleted" => 0
//        );
        $this->_filter($map);
        $order = "id DESC";
        $this->_order($order);
        
        $model = $model->where($map)->order($order);
        if(isset($_GET["typeahead"])) {
            $model = $model->limit(10);
        }
        $list = $model->select();
//        echo $model->getLastSql();exit;
//        print_r($list);
        if($return) {
            return $list;
        }

        $this->response($list);
    }
    
    /**
     * 通用REST GET方法
     */
    public function read($return=false) {
        if($_REQUEST["workflow"]) {
            return $this->doWorkflow();
        }
        
        $name = $this->readModel ? $this->readModel : $this->getActionName();
        $model = D($name);
        
        if($this->relation) {
            $model = $model->relation(true);
        }
        
        $map = array(
            "id" => abs(intval($_GET["id"]))
        );
        $this->_filter($map);
        
        $item = $model->where($map)->find();
        
        if($return) {
            return $item;
        }
        
        $this->response($item);
    }

    /**
     * 通用REST插入方法
     */
    public function insert() {
        
        if($_REQUEST["workflow"]) {
            return $this->doWorkflow();
        }
        
        $name = $this->insertModel ? $this->insertModel : $this->getActionName();
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
            $this->httpError(500);
        }
    }
    
    /**
     * 更新
     */
    public function update() {
        
        if($_REQUEST["workflow"]) {
            return $this->doWorkflow();
        }
        
        $name = $this->updateModel ? $this->updateModel : $this->getActionName();
        $model = D($name);
        
        /**
         * 对提交数据进行预处理
         */
        $this->pretreatment();
        if (false === $model->create()) {
            $this->error($model->getError());
        }
        
        if($this->relation) {
            $model = $model->relation(true);
        }
        // 更新数据
        $result = $model->save();
        if ($result !== false) { //保存成功
            $this->response(array(
                "error" => 0
            ));
        } else {
            //失败提示
            $this->httpError(500);
        }
    }
    
    /**
     * 删除
     */
    public function delete($return = false) {
        $name = $this->getActionName();
        
        $model = D($name);
        $pk = $model->getPk();
        $id = $_REQUEST [$pk];
        
        $rs = $model->doDelete($id);
        
        if($return) {
            return $rs;
        } 
        
        if(!$rs) {
            $this->error(L("operate_failed"));
        }
//        
//        return;
//        if (!empty($model)) {
//            
//            if($this->relation) {
//                $model = $model->relation(true);
//            }
//            
//            if (isset($id)) {
//                $condition = array($pk => array('in', $id));
//                var_dump($model->fields);exit;
//                if(in_array("deleted", $model->fields)) {
////                    echo 123;exit;
//                    $rs = $model->where($condition)->save(array("deleted"=>1));
//                } else {
////                    echo 222;exit;
//                    $rs = $model->where($condition)->delete();
//                }
//                
//                if($return) {
//                    return $rs;
//                }
////                try {
////                    $rs = $model->where($condition)->save(array("deleted"=>1));
////                } catch(Exception $e) {
////                    $rs = $model->where($condition)->delete();
////                }
//            } else {
//                $this->httpError(500);
//            }
//        }
    }
    
    public function foreverDelete() {
        
    }
    
    /**
     * 执行工作流节点
     */
    protected function doWorkflow() {
        $_REQUEST = $_REQUEST ? $_REQUEST : $_POST;
        $mainRowid = abs(intval($_REQUEST["id"]));
        $nodeId = abs(intval($_REQUEST["node_id"]));
        
        if(!$this->workflowAlias or !$mainRowid or !$nodeId) {
           $this->error("not_allowed1");exit;
        }
        
        $workflow = new Workflow($this->workflowAlias);
        $rs = $workflow->doNext($mainRowid, $nodeId, false, false);
        if(false === $rs) {
            $this->error("not_allowed");exit;
        }

        // 结束信息返回true、或者没有任何返回值时跳转
        if(true === $rs or empty($rs)) {
            $this->success();
        }
    }
    
    /**
     * 过滤器
     */
    protected function _filter(&$map) {}
    protected function _order(&$order) {}
    
    /**
     * 对数据进行预处理
     * 
     */
    protected function pretreatment() {
//        switch($this->_method) {
//            case "put":
//                $_POST = I("put.");
//                break;
//        }
    }
    
    /**
     * 执行导出excel
     * @todo 循环效率
     */
    protected function doExport($filename, $data) {
        if(!$this->exportFields or !$data) {
            return;
        }
        
        import("@.ORG.excel.XMLExcel");
        $xls=new XMLExcel;
	$xls->setDefaultWidth(80);
        $xls->setDefaultHeight(20);
	$xls->setDefaultAlign("center");
        $head = array();
        foreach($this->exportFields as $k=>$v) {
//            array_push($row, sprintf('<b>%s</b>', $v));
            array_push($head, sprintf('<b>%s</b>', $v));
        }
        
        foreach($data as $item) {
            $rowTpl = $this->exportFields;
            $fieldTpl = "%s";
            if(array_key_exists("store_min", $item)) {
                if(($item["store_min"]>0 and $item["store_min"]<=$item["num"]) 
                        or ($item["store_max"]>0 and $item["store_max"]>=$item["num"])) {
                    $fieldTpl = '<font color="red">%s</font>';
                }
            }
            foreach($item as $k=>$v) {
                if(array_key_exists($k, $this->exportFields)) {
                    $rowTpl[$k] = sprintf($fieldTpl, $v);
                }
            }
            $xls->addPageRow($head, $rowTpl);
        }
        $xls->export($filename);
//        $xls->addPageRow;
        
        exit;
        
        header("Content-type:application/vnd.ms-excel");
        header("Content-Disposition:attachment;filename={$filename}");
        $excel = array();
        $row = array();
        foreach($this->exportFields as $k=>$v) {
//            array_push($row, sprintf('<b>%s</b>', $v));
            array_push($row, sprintf('%s', iconv("utf-8", "gbk", $v)));
        }
        array_push($excel, implode("\t", $row));
        foreach($data as $item) {
            $row = array();
            $fieldTpl = "%s";
//            if(array_key_exists("store_min", $item)) {
//                if(($item["store_min"]>0 and $item["store_min"]<=$item["num"]) 
//                        or ($item["store_max"]>0 and $item["store_max"]>=$item["num"])) {
//                    $fieldTpl = '<font color="red">%s</font>';
//                }
//            }
            foreach($item as $k=>$v) {
                if(array_key_exists($k, $this->exportFields)) {
                    array_push($row, sprintf($fieldTpl, iconv("utf-8", "gbk", $v)));
                }
            }
            array_push($excel, implode("\t", $row));
        }
        
        echo implode("\r\n", $excel);
    }

    
    private function testResponse() {
        $this->response(array(
            "error" => 1,
            "id" => 1,
            "msg"=> "错误"
        ));
    }
}
