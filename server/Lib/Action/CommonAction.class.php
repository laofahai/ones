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

    protected $appConf;

    protected $loadedApp;

    protected $queryMeta = array();

    protected $dataModelAlias;

    protected $breakAction = false;

    //扩展权限检测
    protected $_extend_permission_check_methods = array();

    public function __construct() {

        //检测是否安装
        if(!$_REQUEST["installing"] && !is_file(ENTRY_PATH."/Data/install.lock")) {
            header("Location:install.html");
            return;
        }

        parent::__construct();

        //修正POST不能正确获取数据问题
        if(in_array($this->_method, array("post", "put")) && !$_POST) {
            $tmp = file_get_contents("php://input");
            $_POST = json_decode($tmp, true);
        }

        import("@.ORG.Auth");

        //判断来路
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

        //修正session问题
        $_REQUEST = array_merge((array)$_COOKIE, (array)$_GET, (array)$_POST);

        $appConfCombined = $this->getAppConfig();

        //缓存数据
        F("appConfCombined", $appConfCombined);
        F("appConf", $this->appsConf);
        F("loadedApp", $this->loadedApp);

        //自动加载路径
        foreach($this->loadedApp as $app) {
            $autoloadPath[] = sprintf("%s/apps/%s/backend", ROOT_PATH, $app);
            $autoloadPath[] = sprintf("%s/apps/%s/backend/Action", ROOT_PATH, $app);
            $autoloadPath[] = sprintf("%s/apps/%s/backend/Model", ROOT_PATH, $app);
            $autoloadPath[] = sprintf("%s/apps/%s/backend/Lib", ROOT_PATH, $app);
            $autoloadPath[] = sprintf("%s/apps/%s/backend/Behavior", ROOT_PATH, $app);
        }
        C("APP_AUTOLOAD_PATH", C("APP_AUTOLOAD_PATH").",". implode(",", $autoloadPath));

        //CURD权限检测
        $this->checkPermission();

        tag("action_end_init");

    }

    /*
     * 读取APP配置
     * **/
    protected function getAppConfig() {

        if($this->compiledAppConf) {
            return $this->compiledAppConf;
        }

        /*
         * 禁用的APP
         * **/
        $model = D("Apps");
        $tmp = $model->select();
        $disabledApps = array();
        foreach($tmp as $t) {
            if($t["status"] != 1) {
                $disabledApps[] = $t["alias"];
            } else {
                $enabledApps[] = $t["alias"];
            }

        }

        /*
         * 应用的配置路径
         * **/
        $appDirs = ROOT_PATH."/apps";
        $dirHandle = opendir($appDirs);
        $blacklist = array(
            ".", "..", "__MACOS", ".DS_Store"
        );
        $navs = array();
        $appConf = array();
        if($dirHandle) {
            while(($file = readdir($dirHandle)) !== false) {
                if(in_array($file, $disabledApps) or !in_array($file, $enabledApps)) {
                    continue;
                }
                $appDir = $appDirs.DS.$file.DS;

                if(!is_dir($appDir) or !is_file($appDir."config.json") or in_array($file, $blacklist)) {
                    continue;
                }
                $tmpConf = json_decode(file_get_contents($appDir."config.json"), true);

                if($tmpConf) {
                    if($tmpConf["navs"]) {
                        $appConf["navs"] = $navs = array_merge_recursive($navs, $tmpConf["navs"]);
                    }
                    if($tmpConf["workflow"]) {
                        foreach($tmpConf["workflow"] as $workflow) {
                            $appConf["workflow"][$workflow] = $file;
                        }
                    }
                    if($tmpConf["plugins"]) {
                        C("tags", array_merge_recursive(
                            (array)C("tags"),
                            $tmpConf["plugins"]
                        ));
                    }
                    $this->appsConf[$file] = $tmpConf;

                    $this->loadedApp[] = $file;
                }
            }
        }

        $this->compiledAppConf = $appConf;
        return $appConf;
    }

    protected function isLogin() {
        return $_SESSION["user"]["id"] ? 1 : 0;
    }
    
    protected function parseActionName($action=null) {
        $action = $action ? $action : ACTION_NAME;
        switch($action) {
            case "insert":
            case "add":
            case "addBill":
                $action = "add";
                break;
            case "update":
            case "edit":
                $action = "edit";
                break;
            case "Index":
            case "index":
            case "read":
            case "list":
                $action = "read";
                break;
        }

        if($this->singleAction) {
            $action = "read";
        }

        
        return $action;
    }
    
    protected function loginRequired() {

        $current = sprintf("%s.%s.%s", GROUP_NAME, MODULE_NAME, $this->parseActionName());
        $current = strtolower($current);
        if (!$this->isLogin() and 
                !in_array($current,
                        C("AUTH_CONFIG.AUTH_DONT_NEED_LOGIN"))) {
            $this->httpError(401);
        }
    }
    
    /**
     * 权限预检测
     */
    protected function checkPermission($path="", $return=false){

        $this->loginRequired();

        if(in_array($this->user["id"], C("suid"))) {
            return true;
        }

        //工作流模式，通过工作流权限判断
        //安全漏洞
        if($_REQUEST["workflow"]) {
            return true;
        }
        
        import('ORG.Util.Auth');//加载类库
        $auth = new Auth();

        $action = $this->getActionName();
        if($action == "doWorkflow" or $_POST["workflow"] or $_GET["workflow"]) {
            return true;
        }

        //权限检测前置方法
        tag("before_check_action_permission");

        $rule = $path ? $path : sprintf("%s.%s.%s", GROUP_NAME, MODULE_NAME, $this->parseActionName());
        $rule = strtolower($rule);
        if(in_array($rule, array_merge(C("AUTH_CONFIG.AUTH_DONT_NEED"), C("AUTH_CONFIG.AUTH_DONT_NEED_LOGIN")))) {
            $rs = true;
        } else {
            $rs = $auth->check($rule, $_SESSION["user"]["id"]);
        }

        if($return){
            return $rs ? true : false;
        } else {
            if(!$rs) {
                Log::write(sprintf("%s try to do: %s, but permission denied.", $this->user["username"], $rule));
                $this->httpError(403, $rule);
                exit;
            }
            
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
        ));exit;
    }
    protected function httpError($code, $msg=null) {
        echo $msg;
        send_http_status($code);
        exit;
    }
    protected function success($msg) {
        $this->response(array(
            "error" => 0,
            "msg"   => $msg
        ));
    }

    protected function _external_action() {
        //动作执行
        $method = "ACT_".$_REQUEST["act"];

        if(method_exists($this, $method)) {
            $this->breakAction = true;
            return $this->$method();
        }
    }

    protected function _extend_rows_permission_index(&$map) {}
    protected function _extend_rows_permission_read() {}
    protected function _extend_rows_permission_update() {}

    public function beforeFilter($model) {
        //搜索
        $map = array();
        $where = array();

        if($_GET["excludeId"]) {
            $map["id"] = array("NEQ", $_GET["excludeId"]);
        }

        if($_GET["_kw"] or $_GET["typeahead"]) {
            $kw = $_GET["_kw"] ? $_GET["_kw"] : $_GET["typeahead"];

            if($model->searchFields) {
                foreach($model->searchFields as $k => $sf) {
                    $where[$sf] = array('like', "%{$kw}%");
                }

            } else {
                $fields = array(
                    "name", "subject", "pinyin", "bill_id", "alias", "factory_code", "factory_code_all"
                );
                foreach($fields as $f) {
                    if($model->fields["_type"][$f]) {
                        $where[$f] = array('like', "%{$kw}%");
                    }
                }
            }

            if(count($where) > 1) {
                $where["_logic"] = "OR";
                $map["_complex"] = $where;
            } else {
                $map = array_merge_recursive($map, $where);
            }

        }

        //过滤器
        if($_GET["_filter_start_dateline"] && $_GET["_filter_end_dateline"]) {
            $map["dateline"] = array("BETWEEN", array(
                strtotime($_GET["_filter_start_dateline"]),
                strtotime($_GET["_filter_end_dateline"])
            ));
        }
        //工作流节点过滤器
        if($_GET["_filter_workflow_node"] && $this->workflowAlias) {
            $workflow = D("Workflow")->getByAlias($this->workflowAlias);
            $processMap = array(
                "workflow_id" => $workflow["id"],
                "node_id" => abs(intval($_GET["_filter_workflow_node"])),
                "status"  => 0
            );

            $inProcess = D("WorkflowProcess")->field("mainrow_id")->where($processMap)->select();

            if($inProcess) {
                foreach($inProcess as $p) {
                    $sourceIds[] = $p["mainrow_id"];
                }
                $map["id"] = array("IN", $sourceIds);
            } else {
                $this->response(array(
                    array("count" => 0, "totalPages"=>0), array()
                ));
                exit;
            }
        }


        //仅回收站数据
        if($_GET["onlyTrash"]) {
            $map["deleted"] = 1;
        }

        return $map;
    }

    public function beforeOrder($model) {
        //排序
        $order = array();
        $orderFields = array("id");
        if($_GET["_si"]) {
            $sortInfos = explode("|", $_GET["_si"]);
            foreach($sortInfos as $s) {
                $direct = substr($s, 0, 1);
                $field = substr($s, 1, strlen($s));
                if(($model->orderFields && in_array($field, $model->orderFields)) or in_array($field, $orderFields)) {
                    $order[] = $field." ".($direct === "-" ? "ASC" : "DESC");
                } else {
                    //判断是否存在此字段
                    //@todo 目前只是简单判断是不是有relationModel的字段
                    if(strpos($field, ".") !== false) {
                        continue;
                    }
                }
            }
        }
        $order = $order ? $order : array("id DESC");
        return $order;
    }

    public function beforeLimit() {
        //分页
        /*
         * _pn => page number
         * _ps => page size
         * **/
        if($_GET["_pn"] && $_GET["_ps"]) {
            $ps = abs(intval($_GET["_ps"]));
            $limit = sprintf("%d,%d",
                (abs(intval($_GET["_pn"]))-1)*$ps,
                $ps
            );
        }
        return $limit;
    }

    /**
     * 
     * 通用REST列表返回 
     **/
    public function index($return=false, $returnIncludeCount=true) {

        $this->_external_action();

        if($this->breakAction) {
            return;
        }

        if(method_exists($this, "_before_index")){
            $this->_before_index();
        }

        $name = $this->indexModel ? $this->indexModel : $this->getActionName();

        $model = D($name);

        /**
         * 查看是否在fields列表中
         */
        
        if (empty($model)) {
            $this->error(L("Server error"));
        }

        $limit = $this->beforeLimit();
        $map = $this->beforeFilter($model);
        $order = $this->beforeOrder($model);

        $this->_filter($map);
        $this->_order($order);

        call_user_func_array(
            array($this, "_extend_rows_permission_index"),
            array(&$map)
        );

        if($_GET["onlyCount"]) {
            $total = $model->where($map)->count();
            $this->response(array(array("count"=>$total)));
            return;
        } else {

            if($this->relation && method_exists($model, "relation")) {
                $model = $model->relation(true);
            }

            $model = $model->where($map)->order($order);

            //AutoComplete字段默认只取10条
            if(isset($_GET["typeahead"])) {
                $limit = 10;
            }
            if(isset($_GET["limit"])) {
                $limit = abs(intval($_GET["limit"]));
            }

            if($limit) {
                $model = $model->limit($limit);
            }

            if($order) {
                $model = $model->order($order);
            }

            $list = $model->select();


            $this->queryMeta = array(
                "map" => $map,
                "limit" => $limit,
                "order" => $order
            );

            //绑定模型数据
            if($this->dataModelAlias) {
                $params = array(
                    $list, $this->dataModelAlias, false, true
                );

                tag("assign_dataModel_data", $params);
                $list = $params[0];
            }
        }

        $list = reIndex($list);
        //包含总数
        if($_GET["_ic"] && $returnIncludeCount) {
            $total = $model->where($map)->count();
            $totalPages = ceil($total/$_GET["_ps"]);
            if(!$totalPages) {
                $totalPages = 1;
            }

            $returnData = array(
                array("count" => $total, "totalPages"=>$totalPages),
                reIndex($list),
            );

            if($return) {
                return $returnData;
            }

            $this->response($returnData);
        } else {
            if($return) {
                return reIndex($list);
            }
            $this->response($list);
        }
    }


    /**
     * 通用REST GET方法
     */
    public function read($return=false) {

        $this->_external_action();
        if($this->breakAction) {
            return;
        }

        if($_REQUEST["workflow"]) {
            return $this->doWorkflow();
        }

        $id = $_GET["id"];
        if($_GET["single"]) {
            $id = abs(intval(array_shift(explode(",", $id))));
        }
        
        $name = $this->readModel ? $this->readModel : $this->getActionName();
        $model = D($name);

        $map = $this->beforeFilter($model);
        
        if($this->relation && method_exists($model, "relation")) {
            $model = $model->relation(true);
        }

        if($id) {
            $map["id"] = array("IN", explode(",", $id));
        } else {
            foreach($_GET as $k=>$g) {
                if(in_array($k, array("id", "s", "_URL_"))) {
                    continue;
                }
                $map[$k] = $g;
            }
        }
        $this->_filter($map);

        $extendPermissionCheck = call_user_func_array(
            array($this, "_extend_rows_permission_read"),
            array($id, &$map)
        );

        $tmp = $model->where($map)->select();

        //扩展权限检测
        if(false === $extendPermissionCheck) {
            $this->error("need_authorize");
            return;
        }

        if(!$tmp) {
            return;
        }

        $item = array();

        if($this->dataModelAlias) {
            $params = array(
                $tmp,
                $this->dataModelAlias,
                false
            );

            tag("assign_dataModel_data", $params);

            $tmp = $params[0];
        }

        if(count($tmp) === 1) {
            $item = $tmp[0];
        } else {
            foreach($tmp as $v) {
                $item[$v["id"]] = $v;
            }
        }

        if($return) {
            return $item;
        }
        
        $this->response($item);
    }

    /**
     * 通用REST插入方法
     */
    public function insert($return = false) {
        if($_REQUEST["workflow"]) {
            return $this->doWorkflow();
        }

        $this->_external_action();

        if($this->breakAction) {
            return;
        }
        
        $name = $this->insertModel ? $this->insertModel : $this->getActionName();
        $model = D($name);

        $extendPermissionCheck = call_user_func_array(
            array($this, "_extend_rows_permission_read"),
            array()
        );

        if(false === $extendPermissionCheck) {
            $this->error("need_authorize");
            return;
        }

        /**
         * 对提交数据进行预处理
         */
        $this->pretreatment();
        if (false === $model->create()) {
            $this->error($model->getError());
        }
        if ($this->relation && method_exists($model, "relation")) {
            $model = $model->relation(true);
        }
        $result = $model->add();

        if ($result !== false) { //保存成功

            /*
             * 插入数据模型数据
             * **/
            if($this->dataModelAlias) {
                $data = $_POST;
                $data["id"] = $result;
                $params = array(
                    $this->dataModelAlias,
                    $data,
                    false
                );
                tag("insert_dataModel_data", $params);
            }

            if($return) {
                return $result;
            }
            $this->response(array(
                "error" => 0,
                "id" => $result
            ));
        } else {
            Log::write($model->getLastSql(), Log::SQL);
            if($return) {
                return false;
            }
            //失败提示
            $this->error($model->getError());
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

        $id = abs(intval($_GET["id"]));

        $extendPermissionCheck = call_user_func_array(
            array($this, "_extend_rows_permission_update"),
            array($id)
        );

        if(false === $extendPermissionCheck) {
            $this->error("need_authorize");
            return;
        }


        //不可修改状态
        if($this->lockedStatus) {
            $sourceData = $model->find($_POST["id"]);
            if(isset($sourceData["status"]) && $sourceData["status"] >= $this->lockedStatus) {
                return $this->error("in_workflow");
            }
        }
        
        /**
         * 对提交数据进行预处理
         */
        $this->pretreatment();
        if (false === $model->create($_POST)) {
            $this->error($model->getError());
        }
        
        if($this->relation && method_exists($model, "relation")) {
            $model = $model->relation(true);
        }
        // 更新数据
        $result = $model->save();
//        echo $model->getLastSql();exit;

        if ($result !== false) { //保存成功

            /*
             * 修改数据模型数据
             * **/
            if($this->dataModelAlias) {
                $data = $_POST;
                $params = array(
                    $this->dataModelAlias,
                    $data
                );
                tag("insert_dataModel_data", $params);
            }

            $this->response(array(
                "error" => 0
            ));
        } else {
            //失败提示
            $this->error($model->getError());
        }
    }
    
    /**
     * 删除
     */
    public function delete($return = false) {

        $name = $this->deleteModel ? $this->deleteModel : $this->getActionName();
        $model = D($name);
        $pk = $model->getPk();
        $id = $_REQUEST [$pk];
        if(method_exists($model, "doDelete")) {
            $rs = $model->doDelete($id);
        } else {
            $rs = $model->where(array(
                "id" => array("IN", explode(",", $id))
            ))->delete();
        }

        if(false === $rs) {
            Log::write("Delete row failed:".$name.",".$id);
            $this->error("delete_failed");
        } else if($this->dataModelAlias) {
            $params = array(
                $id,
                $this->dataModelAlias
            );
            tag("delete_dataModel_data", $params);
        }

        if($return) {
            return $rs;
        }
    }
    
    public function foreverDelete() {}
    
    /**
     * 执行工作流节点
     */
    protected function doWorkflow() {
        $mainRowid = $_GET["id"] ? abs(intval($_GET['id'])) : abs(intval($_POST['id']));

        $nodeId = $_GET["node_id"] ? abs(intval($_GET["node_id"])) : abs(intval($_POST["node_id"]));

        if(!$this->workflowAlias or !$mainRowid or !$nodeId) {
            Log::write("workflow error: something is wrong : {$this->workflowAlias},{$mainRowid},{$nodeId}");
            $this->error("not_allowed1");return;
        }
        
        $workflow = new Workflow($this->workflowAlias);
        $rs = $workflow->doNext($mainRowid, $nodeId, false, false);
        if(false === $rs) {
            Log::write("workflow error when execute node: ".$nodeId.",". $mainRowid);
            $this->error("not_allowed");return;
        }

        // 结束信息返回true、或者没有任何返回值时跳转
        if(true === $rs or empty($rs)) {
            $this->success("Success");
        }
    }
    
    /**
     * 过滤器
     */
    protected function _filter(&$map) {}
    protected function _order(&$order) {}
    
    /**
     * 对数据进行预处理
     */
    protected function pretreatment() {}
    
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
            if(is_numeric($k)) {
                $head[$v] = lang($v);
            } else {
                $head[$k] = $v;
            }
        }

//        print_r($head);exit;
        
        foreach($data as $item) {
            $rowTpl = array();

            foreach($head as $k=>$v) {
                if(array_key_exists($k."_label", $item)) {
                    $rowTpl[$k] = $item[$k."_label"];
                } else if(array_key_exists($k, $item)) {
                    $rowTpl[$k] = $item[$k];
                }
            }
            $xls->addPageRow($head, $rowTpl);
        }
        $xls->export($filename);
    }

}

