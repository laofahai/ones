<?php

namespace Common\Controller;

use Account\Service\AuthorizeService;
use Common\Lib\CommonLog;
use Home\Service\SchemaService;
use MessageCenter\Service\MessageCenter;
use Smtp\Service\SendMailService;
use Think\Controller\RestController;
use Common\Lib\RecursiveFileFilterIterator;
use Common\Lib\Schema;
use Home\Service\AppService;
use Think\Log;
use Think\Think;

class BaseRestController extends RestController {

    protected $allowMethod = array();
    protected $allowType = array('json');
    protected $defaultType = 'json';

    //基本应用
    protected $baseApps = array('home', 'dataModel', 'dashboard', 'account', 'messageCenter');
    //已启用应用
    protected $activeApps = array();

    // 应用参数配置
    protected $appConfigs = array();
    // 后端参数配置
    protected $bootstrapConfigs = array();
    // 当前语言
    protected $currentLanguage = 'zh-cn';
    // 当前用户信息
    protected $user = array();
    // 当前公司信息
    protected $company = array();

    // 输出sql
    protected $echoSQL = false;

    // 中断当前操作
    protected $breakAction = false;

    // 当前数据模型字段
    protected $dataModelFields = array();

    // 当前数据表名称(对应的模型名称，如data_model_field => DataModelField)
    protected $model_name;

    // 当前节点的授权flag
    protected $current_node_auth_flag;

    // 模块别名，eg: crm.customerCommunicate
    protected $module_alias;

    // 当前用户已授权节点
    static protected $authed_nodes;

    // 是否当前公司的超级管理账户
    protected $is_super_user = false;

    // 使用自定义的model
    protected $listModel;
    protected $readModel;
    protected $deleteModel;

    public function __construct() {

        //支持方法
        if(!$this->allowMethod) {
            $this->allowMethod = explode(",", strtolower(SUPPORTED_METHOD));
        }

        //session token
        if(I('server.HTTP_TOKEN') && strtolower(I('server.HTTP_TOKEN')) !== 'null') {
            session(
                array(
                    'id'=>I("server.HTTP_TOKEN"),
                    'expire'=>99999,
                )
            );
            session('[start]');
            $this->user = I("session.user");
            $this->is_super_user = $this->user['is_super_user'];

            if(isset($_SESSION['user']) && (!get_current_company_id() || !get_current_user_id())) {
                return $this->login_required();
            }

        }

        tag('before_controller_construct');

        parent::__construct();

        // 当前请求 =》 auth_node
        $this->current_action_all = sprintf("%s.%s.%s.%s",
            lcfirst(MODULE_NAME),
            lcfirst(CONTROLLER_NAME),
            lcfirst(ACTION_NAME),
            $this->_method
        );
        
        //当前用户所属公司
        if($this->user) {
            $this->company = D("Account/Company")->relation(true)->find(get_current_company_id());
        }

        //当前公司启用应用
        $this->activeApps = $this->baseApps;
        if($this->company) {
            $this->activeApps = array_merge($this->activeApps, get_array_by_field($this->company['apps'], "alias"));
        }

        //启用应用
        AppService::active($this->activeApps, $this->baseApps);

        //当前模块前端别名
        $this->module_alias = __(sprintf('%s.%s', lcfirst(MODULE_NAME), lcfirst(CONTROLLER_NAME)));

        //导入非当前应用的插件及函数等信息
        foreach($this->activeApps as $app) {
            $app = ucfirst($app);
            if($app == MODULE_NAME or $app == "common") {
                continue;
            }

            // 插件
            if(is_file(APPLICATION_PATH.$app.'/Conf/tags.php')) {
                \Think\Hook::import(require APPLICATION_PATH.$app.'/Conf/tags.php');
            }

            // 函数
            if(is_file(APPLICATION_PATH.$app.'/Common/function.php')) {
                require_once APPLICATION_PATH.$app.'/Common/function.php';
            }
        }

        //基本运行配置
        $this->bootstrapConfigs = parse_yml(ENTRY_PATH.'/config.yaml');

        //当前接口版本
        if(I('server.HTTP_API_VERSION')) {
            define('API_VERSION', I('server.HTTP_API_VERSION'));
        } else {
            define('API_VERSION', false);
        }

        //当前语言
        $this->currentLanguage = $this->bootstrapConfigs["default_language"] ? $this->bootstrapConfigs["default_language"] : 'zh-cn' ;
        if(I("server.HTTP_CLIENT_LANGUAGE")) {
            $this->currentLanguage = I("server.HTTP_CLIENT_LANGUAGE");
        }
        if(I('get.lang')) {
            $this->currentLanguage = I('get.lang');
        }
        define('CURRENT_LANGUAGE', $this->currentLanguage);
        
        /*
         * 解析应用配置
         * * */
        $cachedAppConfig = F("configs/app_config_all");
        if(DEBUG or !$cachedAppConfig) {
            foreach (new RecursiveFileFilterIterator(APP_PATH, "config.yml") as $item) {
                $app = lcfirst(basename(dirname($item)));
                $this->appConfigs[$app] = parse_yml($item);
            }
            
            F("configs/app_config_all", $this->appConfigs);
        } else if(!DEBUG && $cachedAppConfig) {
            $this->appConfigs = $cachedAppConfig;
        }
        AppService::$allAppConfigs = $this->appConfigs;

        foreach($this->appConfigs as $app=>$config) {
            $this->bootstrapConfigs['auth_dont_need_login'] =
                array_merge_recursive($this->bootstrapConfigs['auth_dont_need_login'], (array)$config['auth_dont_need_login']);
            $this->bootstrapConfigs['auth_dont_need_check'] =
                array_merge_recursive($this->bootstrapConfigs['auth_dont_need_check'], (array)$config['auth_dont_need_check']);
        }

        // 当前表名
        if(!$this->model_name) {
            $this->model_name = ucfirst(CONTROLLER_NAME);
        }

        // 获得用户已授权节点
        $authed_nodes = session('authed_nodes');
        if(APP_DEBUG || !$authed_nodes) {
            $authed_nodes = D('Account/Authorize')->get_authed_nodes();
            session('authed_nodes', $authed_nodes);
        }

        self::$authed_nodes = $authed_nodes;
        AuthorizeService::set_authed_nodes($authed_nodes);

        //当前动作权限检测
        // @todo event, event_get
        $current_node_auth_flag = DEBUG ? 1 : $this->check_permission();
        if(substr($this->_method, 0,5) !== 'event' && false === $current_node_auth_flag) {
            $node_lang = __(lcfirst(MODULE_NAME).'.METHODS.'.$this->_method).' '.__(lcfirst(MODULE_NAME).'.'.ucfirst(CONTROLLER_NAME));
            return $this->httpError(403, __("common.Permission Denied").": ".$node_lang. "({$this->current_action_all})");
        }

        $this->current_node_auth_flag = (integer)$current_node_auth_flag;
        tag('after_controller_construct');
    }

    public function parent_construct() {
        return parent::__construct();
    }

    public function index() {
        switch($this->_method) {
            case "get":
            case "event_get":
                return I('get.id') ? $this->on_read() : $this->on_list();
            break;
            case "put":
                return $this->on_put();
            break;
            case "post":
                return $this->on_post();
            break;
            case "delete":
            case "remove":
                return $this->on_delete();
        }
    }

    public function read() {
        $this->on_read();
    }

    /*
     * 默认get处理
     * 支持API接口版本，子类覆盖此方法需判断是否存在API接口版本
     *
     * GET参数：
     *  _kw: keyword
     *  _mf: match field
     *  _mv: match field value
     *  _ei: exclude id
     *  _ps: page size
     *  _pn: page number
     *  _fd: fields 查询字段
     *  _oc: only Count
     *  _m: method 执行其他方法
     * * */
    public function on_list($return=false) {

        if($api_method = $this->api_version_method_exists('on_list')) {
            return $this->$api_method($return);
        }

        $extra_method = '_EM_'.I('get._m');
        if(I('get._m') && method_exists($this, $extra_method)) {
            return $this->$extra_method($return);
        }

        unset($extra_method);

        // 无ID GET时
        if(in_array($this->_method, array('event_get'))) {
            return $this->on_read();
        }

        $modelName = sprintf("%s/%s", MODULE_NAME, CONTROLLER_NAME);
        $this->_external_action();

        if($this->breakAction) {
            return;
        }

        if(method_exists($this, "_before_index")){
            $this->_before_index();
        }

        $modelName = $this->listModel ? $this->listModel : $modelName;
        $model = D($modelName, "Model");

        if (empty($model)) {
            E(__("Server error"));
        }

        //fix non-view model
        if(method_exists($model, 'getProperty') && !$model->getProperty('viewFields')) {
            $viewFields = array();
            $viewFields[CONTROLLER_NAME] = array(
                '*', '_type' => 'left'
            );
            $model->setProperty('viewFields', $viewFields);
        }

        // 查询字段
        if(I('get._fd')) {
            $model = $model->field(I('get._fd'));
        }

        // 前置操作
        $limit = $this->beforeLimit();
        $map = $this->beforeFilter($model);
        $order = $this->beforeOrder($model);

        $this->_filter($map);
        $this->_order($order);

        //仅返回条目数量
        if(I("get._oc")) {
            $total = $model->where($map)->count();
            $this->response(array(array("count"=>$total)));
            return;
        } else {

            // 数据模型字段
            if(I('get._df')) {
                $model = $this->assign_data_model_data($modelName, $model, $map);
            }

            $model = $model->where($map)->order($order);

            //AutoComplete字段默认只取10条
            if(isset($_GET['typeahead'])) {
                $limit = 10;
            }
            if(isset($_GET["get.limit"])) {
                $limit = abs(intval(I("get.limit")));
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

        }

        $list = reIndex((array)$list);

        $list = !$list[0] ? [] : $list;

        $progress_model = D('Bpm/WorkflowProgress');
        $list = $progress_model->assign_last_progress_to_list($list);

        if(method_exists($this, '_before_list_response_')) {
            $list = $this->_before_list_response_($list);
        }

        //包含总数
        if(I("get._ic")) {
            $total = $model->where($map)->count();
            $totalPages = ceil($total/I("get._ps"));
            if(!$totalPages) {
                $totalPages = 1;
            }

            $list = Schema::data_format($list, $model);
            $list = reIndex($list);

            $returnData = array(
                array("count" => $total, "totalPages"=>$totalPages),
                $list,
            );

            if($return) {
                return $returnData;
            }

            $this->response($returnData);
        } else {
            if($return) {
                return $list;
            }
            $this->response($list, $model);
        }

    }

    /*
     * 默认post处理
     * * */
    public function on_post() {

        if($api_method = $this->api_version_method_exists('on_post')) {
            return $this->$api_method();
        }

        $extra_method = '_EM_'.I('get._m');
        if(I('get._m') && method_exists($this, $extra_method)) {
            return $this->$extra_method();
        }
        unset($extra_method);

        $modelName = sprintf("%s/%s", MODULE_NAME, CONTROLLER_NAME);
        $model = D($modelName, "Service");

        $model->real_model_name = $this->model_name;

        if(method_exists($this, '_before_insert')) {
            $this->_before_insert();
        }

        // 插入数据之前的插件钩子
        $params = array();
        tag('before_item_insert', $params);

        if(!$model->not_belongs_to_company) {
            if(method_exists($model, 'getProperty') && !$model->getProperty('_auto')) {
                $model = $model->setProperty('_auto', array(
                    array("company_id", "get_current_company_id", 1, "function")
                ));
            }
        }

        if(!$model->create()) {
            $error = $model->getError();
            return E($error ? $error : __('common.Data Object Can Not Be Created'));
        }

        if(false === $model->add()) {
//            echo $model->getLastSql();exit;
            $error = $model->getError();
            if(DEBUG) {
                $error.= "\n".$model->getLastSql();
            }
            return E($error ? $error : __('common.Add Failed'));
        }

        $id = $model->getLastInsID();

        /*
         * 通过消息中心广播事件
         * */
        $app_alias = lcfirst(MODULE_NAME);
        $module_alias = lcfirst(CONTROLLER_NAME);
        $subject = I('post.subject') ? I('post.subject') : I('post.name');
        $subject = $subject ? $subject : '#'.$id;
        MessageCenter::broadcast(['add'], [
            "id" => $id,
            "subject" => $subject,
            "module"  => $app_alias.'.'.$module_alias
        ]);

        // 完成插入之后的插件钩子
        // 配合前置插件参数
        $params['insert_id'] = $id;
        tag('after_item_insert', $params);

        $data_model_fields = explode(",", I('post._data_model_fields_'));

        $data_model = D('DataModel/DataModelData', 'Service');
        $data_model->insert($id, I('post.'), $data_model_fields);

        if(method_exists($this, '_after_insert')) {
            $this->_after_insert($id);
        }
    }

    /*
     * 默认read
     * */
    public function on_read($return = false) {

        if($api_method = $this->api_version_method_exists('on_read')) {
            return $this->$api_method($return);
        }

        $extra_method = '_EM_'.I('get._m');
        if(I('get._m') && method_exists($this, $extra_method)) {
            return $this->$extra_method($return);
        }
        unset($extra_method);

        $modelName = sprintf("%s/%s", MODULE_NAME, CONTROLLER_NAME);
        $this->_external_action();

        if($this->breakAction) {
            return;
        }

        if(method_exists($this, "_before_read")){
            $this->_before_read();
        }

        $id = I("get.id");

        $modelName = $this->readModel ? $this->readModel : $modelName;
        $model = D($modelName, "Model");

        // 查询字段
        if(I('get._fd')) {
            $model = $model->field(I('get._fd'));
        }

        // 数据模型字段
        if(I('get._df')) {
            $model = $this->assign_data_model_data($modelName, $model, $map, $modelName);
        }

        $map = $this->beforeFilter($model);


        if($id) {
            $map["id"] = $id;
        }
        $this->_filter($map);


        if(!$model->getProperty('viewFields')) {
            $viewFields = array();
            $viewFields[CONTROLLER_NAME] = array(
                '*', '_type' => 'left'
            );
            $model->setProperty('viewFields', $viewFields);
        }

        $item = $model->where($map)->find();

        if($this->echoSQL) {
            echo $model->getLastSql();exit;
        }

        if(!$item) {
            return;
        }

        // 工作流信息
        if($item['workflow_id']) {
            $workflow_progress_service = D('Bpm/WorkflowProgress');
            $item['last_workflow_progress'] = $workflow_progress_service->get_latest_progress($item['workflow_id'], $item['id']);
        }

        if(method_exists($this, '_before_item_response_')) {
            $item = $this->_before_item_response_($item);
        }

        if($return) {
            return $item;
        }

        $this->response($item, $model);
    }


    /*
     * 默认PUT处理
     * */
    public function on_put() {

        if($api_method = $this->api_version_method_exists('on_put')) {
            return $this->$api_method();
        }

        $id = I('get.id');

        $extra_method = '_EM_'.I('get._m');
        if(I('get._m') && method_exists($this, $extra_method)) {
            return $this->$extra_method();
        }
        unset($extra_method);

        $modelName = sprintf("%s/%s", MODULE_NAME, CONTROLLER_NAME);
        $model = D($modelName, "Service");
        $model->real_model_name = $this->model_name;

        if(method_exists($this, '_before_update')) {
            $this->_before_update();
        }

        if(!$model->not_belongs_to_company) {
            if(method_exists($model, 'getProperty') && !$model->getProperty('_auto')) {
                $model = $model->setProperty('_auto', array(
                    array("company_id", "get_current_company_id", 1, "function")
                ));
            }
        }

        $source = $model->find($id);
        if(array_key_exists('company_id', $source) && $source['company_id'] != get_current_company_id()) {
            return $this->error(__('common.Can not edit item which not you added'));
        }

        // 插入数据之前的插件钩子
        $params = array();
        tag('before_item_update', $params);

        unset($_POST['company_id']);
        if(false === $model->create(I('post.'))) {
            return E($model->getError());
        }
        $rs = $model->where(['id'=>I('get.id')])->save();
        if(false === $rs) {
            return E($model->getError());
        }

        /*
         * 通过消息中心广播事件
         * */
        $app_alias = lcfirst(MODULE_NAME);
        $module_alias = lcfirst(CONTROLLER_NAME);

        MessageCenter::broadcast(['edit'], [
            "id" => $id,
            "subject" => '#' . $id,
            "module"  => $app_alias.'.'.$module_alias
        ]);

        // 完成更新之后的插件钩子
        // 配合前置插件参数
        $params['update_id'] = I('get.id');
        tag('after_item_update', $params);

        $data_model_fields = explode(",", I('post._data_model_fields_'));

        $data_model = D('DataModel/DataModelData', 'Service');
        $data_model->insert(I('get.id'), I('post.'), $data_model_fields, $modelName);

        if(method_exists($this, '_after_update')) {
            $this->_after_update($id);
        }

        return $rs;
    }

    /*
     * 默认删除处理
     * */
    public function on_delete($return = false) {

        if(I('request.forever_delete')) {
            return $this->error("为防止数据丢失， 系统禁用了永久删除功能");
        }

        if($api_method = $this->api_version_method_exists('on_delete')) {
            return $this->$api_method($return);
        }

        $modelName = $this->deleteModel ? $this->deleteModel : sprintf("%s/%s", MODULE_NAME, CONTROLLER_NAME);
        $model = D($modelName);
        $model->real_model_name = $this->model_name;
        $ids = explode(',', I('get.id'));

        $source_rows = $model->where(['id' => ['in', $ids]])->select();

        if(!$source_rows) {
            return false;
        }

        $company_id = get_current_company_id();
//        print_r($source_rows);
        foreach($source_rows as $row) {
            if(!array_key_exists('company_id', $row)) {
                break;
            }
            if($row['company_id'] != $company_id) {
                return $this->error(__('common.Can not edit item which not you added'));
            }
        }

        if(method_exists($model, "do_delete")) {
            $rs = $model->do_delete($ids);
        } else {
            $table_name = $model->get('tableName') ? $model->get('tableName') : model_name_to_table_name($model->get('name'));
            $schema = SchemaService::getSchemaByApp(lcfirst(MODULE_NAME), $table_name);

            if($schema[$table_name]['enable_trash']) {
                $rs = $model->where(["id" => array("IN", $ids)])->save([
                    "trashed" => "1"
                ]);
            } else {
                $rs = $model->where(array(
                    "id" => array("IN", $ids)
                ))->delete();
            }
        }

        if(false === $rs) {
            return $this->error(__("common.Operation Failed"). ': ' .$model->getError());
        }

        $params = array(
            'deleted' => $ids
        );
        tag('after_item_delete', $params);

        if($return) {
            return $return;
        }

        // 删除相关工作流进程数据
        $progress_service = D('Bpm/WorkflowProgress');
        foreach($source_rows as $row) {
            if($row['workflow_id']) {
                $progress_service->where([
                    'workflow_id' => $row['workflow_id'],
                    'source_id'   => $row['id']
                ])->delete();
            }
        }

        // 删除数据模型数据
        $data_model = D('DataModel/DataModelData', 'Service');
        $data_model->delete_data($ids, explode(",", I('get._df')));

        if(method_exists($this, '_after_delete')) {
            $this->_after_delete($ids);
        }

        /*
         * 通过消息中心广播事件
         * */
        $app_alias = lcfirst(MODULE_NAME);
        $module_alias = lcfirst(CONTROLLER_NAME);
        $subject = [];
        foreach($source_rows as $row) {
            $tmp = $row['subject'] ? $row['subject'] : $row['name'];
            if(!$tmp) {
                $tmp = '#' . $row['id'];
            }
            array_push($subject, $tmp);
        }
        MessageCenter::broadcast(['delete'], [
            "id" => $ids,
            "subject" => implode(',', $subject),
            "module"  => $app_alias.'.'.$module_alias
        ]);

        $msg = sprintf(__('common.Success delete %s'), count($ids))." ";
        $msg .= __(sprintf('%s.%s', lcfirst(MODULE_NAME), camelCaseSpace(CONTROLLER_NAME)));
        $this->success($msg);

    }
    
    /**
     * 过滤器
     */
    protected function _filter(&$map) {}
    protected function _order(&$order) {}

    /*
     * 前置过滤器
     * */
    protected function beforeFilter($model) {
        //搜索
        $map = array();
        $where = array();

        $model->real_model_name = $this->model_name;

        // match field
        if(I("get._mf") && isset($_GET['_mv'])) {
            $mf = explode(',', I('get._mf'));
            $mv = explode(',', I('get._mv'));
            for($i=0; $i<count($mf);$i++) {
                if($mf[$i] && isset($mv[$i])) {
                    if($mv[$i] === 'undefined') {
                        $map[$mf[$i]] = ['LIKE', "%".I('get._kw')."%"];
                    } else {
                        $map[$mf[$i]] = $mv[$i];
                    }

                }
            }
        }


        // exclude id
        if(isset($_GET['_ei'])) {
            $map["id"] = array("NEQ", I("get._ei"));
        }

        /*
         * 关键字模糊搜索
         * **/
        if(I("get._kw") or I("get.typeahead")) {
            $kw = I("get._kw") ? I("get._kw") : I("get.typeahead");
            if(I('get._mf') && !I('get._mv')) {
                $_mf = explode(',', I('get._mf'));
                if(count($_mf) == 1) {
                    $map[$_mf[0]] = array('LIKE', "%{$kw}%");
                } else {
                    foreach($_mf as $m) {
                        $tmp_mf_field = strpos($m, '.') === false ? $this->model_name.'.'.trim($m) : $m;
                        $where[$tmp_mf_field] = array('LIKE', "%{$kw}%");
                    }
                }

            } else {
                // 模型包含fuzzy search属性，则尝试使用
                if($model->fuzzy_search) {
                    foreach($model->fuzzy_search as $k => $sf) {
                        $where[$sf] = array('LIKE', "%{$kw}%");
                    }
                // 否则将尝试使用几个常用字段
                } else if($model->fuzzy_search !== false) {
                    $fields = array(
                        "name"
                    );
                    foreach($fields as $f) {
                        $where[$this->model_name.'.'.$f] = array('LIKE', "%{$kw}%");
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

        //仅回收站数据
        // only trash
        if(I("get._ot")) {
            $map[$this->model_name.'.trashed'] = '1';
        } else {
            $table_name = $model->get('tableName') ? $model->get('tableName') : model_name_to_table_name($model->get('name'));
            $schema = SchemaService::getSchemaByApp(lcfirst(MODULE_NAME), $table_name);
            if($schema[$table_name]['enable_trash']) {
                $map[$this->model_name.'.trashed'] = '0';
            }
        }

        /*
         * 节点flag check
         * */
        $map = AuthorizeService::get_map_by_flag($this->current_node_auth_flag, $map, $this->model_name);

        return $map;
    }

    /*
     * 前置排序处理
     * */
    protected function beforeOrder($model) {
        //排序
        $order = array();
        if(I("get._si")) {
            $sortInfos = explode("|", I("get._si"));
            foreach($sortInfos as $s) {
                $direct = substr($s, 0, 1);
                $field = substr($s, 1, strlen($s));
                $order[] = $field." ".($direct === "-" ? "DESC" : "ASC");
            }
        }

        $default_order = $model->getProperty('order');
        $default_order = $default_order ? $default_order : "id DESC";

        $order = $order ? $order : $default_order;
        return $order;
    }

    /*
     * 前置limit处理
     * */
    public function beforeLimit() {
        //分页
        /*
         * _pn => page number
         * _ps => page size
         * **/
        if(I("get._pn") && I("get._ps")) {
            $ps = abs(intval(I("get._ps")));
            $limit = sprintf("%d,%d",
                (abs(intval(I("get._pn")))-1)*$ps,
                $ps
            );
        }
        return $limit;
    }

    /*
     * 1、将数据模型加入至源数据viewFields
     * 2、将字段增加至是否可搜索(模糊)
     *
     * 精准匹配使用_mf和_mv参数
     * */
    protected function assign_data_model_data($modelName, $model, &$map) {
        $fields = $this->get_data_model_fields();

        $viewFields = array();
        if(!$model->fuzzy_search) {
            $model->fuzzy_search = array();
        }
        foreach($fields as $k=>$field) {
            $field_table = ($field['search_able'] ? 'DataModelDataSearch' : 'DataModelData');
            // 虚拟视图模型
            $viewFields[$field_table] = array(
                'data' => $field['alias'],
                '_on' => sprintf(
                    '%s.source_id=%s.id AND %s.data_model_field_id=%d',
                    $field_table,
                    end(explode('/', $modelName)),
                    $field_table,
                    $field['id']
                ),
                '_type' => 'left'
            );
            // 模糊匹配
            if($field['search_able'] == "1") {
                $model->fuzzy_search = array_push($model->fuzzy_search, $field['alias']);
            }
        }

        $model->setProperty('viewFields', array_merge(
            $model->getProperty('viewFields'),
            $viewFields
        ));

        return $model;
    }

    /*
     * 获得当前的数据模型字段
     * */
    private function get_data_model_fields() {
        if($this->dataModelFields) {
            return $this->dataModelFields;
        }

        $data_model_fields = D('DataModel/DataModelField', 'Service');
        $this->dataModelFields = $data_model_fields->get_fields_by_module(
            sprintf('%s.%s', lcfirst(MODULE_NAME), lcfirst(CONTROLLER_NAME)),
            array(
                'id' => array('IN', '0,'.I('get._df'))
            )
        );
        return $this->dataModelFields;
    }

    
    /*
     * 权限检测
     * @param String $node 权限节点名称，默认为当前动作
     * **/
    protected function check_permission($node=false) {

        if(D('Account/UserInfo', 'Service')->is_super_user()) {
            return true;
        }

        $authed_nodes = self::$authed_nodes;

        $node = false !== $node ? $node : $this->current_action_all;
        
        $node = strtolower($node);
        $without_action_node = sprintf('%s.%s.%s', lcfirst(MODULE_NAME), lcfirst(CONTROLLER_NAME), $this->_method);

        if(in_array($node, $this->bootstrapConfigs['auth_dont_need_login'])
            || in_array($without_action_node, $this->bootstrapConfigs['auth_dont_need_login'])) {
            return true;
        }

        if(!in_array($node, $this->bootstrapConfigs['auth_dont_need_login']) && !$this->is_login()) {
            return $this->login_required($node);
        }

        if(in_array($node, $this->bootstrapConfigs['auth_dont_need_check'])
            || in_array($without_action_node, $this->bootstrapConfigs['auth_dont_need_check'])) {
            return true;
        }

        foreach($authed_nodes as $k=>$v) {
            // app.module.action.method 类型
            if($v['node'] === $node || $v['node'] == $without_action_node) {
                return $v['flag'];
            }
        }

        return false;
        
    }
    
    protected function is_login() {
        return $this->user['id'] > 0;
    }

    protected function login_required($node=null) {
        return $this->httpError(401, __("account.Login Required").($node ? ": ".$node : ""));
    }

    public function _EM_untrash($ids) {
        $modelName = $this->deleteModel ? $this->deleteModel : sprintf("%s/%s", MODULE_NAME, CONTROLLER_NAME);
        $model = D($modelName);
        $model->real_model_name = $this->model_name;
        $ids = explode(',', I('get.id'));

        $model->where([
            'id' => ["in", $ids]
        ])->save(['trashed'=>'0']);
    }
    
    /*
     * 应用是否启用
     * **/
    protected function is_app_active($app) {
        return in_array($app, $this->activeApps);
    }

    /*
     * REST返回JSON
     * @override
     * @param $data 返回数据
     * @param $model 可选参数，传递此参数将对返回数据根据数据表定义进行强制类型转换处理
     * */
    protected function response($data, $model=null, $is_table=false, $app=MODULE_NAME) {
        /*
         * 格式化数据
         * **/
        if($model) {
            $data = Schema::data_format($data, $model, $is_table, $app);
        }

        $data = $this->append_log_to_data($data);

        return parent::response($data, 'json');
    }

    /*
     * 返回请求的API版本方法是否存在
     * @param $method 当前方法名称，支持on_list, on_read, on_post, on_put, on_delete
     * */
    protected function api_version_method_exists($method){
        if(!API_VERSION) {
            return false;
        }

        $method = $method.'_'.API_VERSION;
        return method_exists($this, $method);
    }
    
    /*
     * error
     * **/
    protected function error($message='',$jumpUrl='',$ajax=false) {
        return $this->response(array(
            'error'=> 1,
            'msg'  => $message
        ));
    }
    
    protected function httpError($code, $msg=null) {
        send_http_status($code);
        exit($msg ? $msg : 'HTTP '.$code);
    }
    
    protected function success($message='', $jumpUrl = '', $ajax = false) {
        $this->response(array(
            "error" => 0,
            "msg"   => $message
        ));
    }

    /*
     * 日志 附加在返回的数据中
     * */
    protected function append_log_to_data($data) {
        if(true !== APP_DEBUG || !$data) {
            return $data;
        }

        $debug_info = [];
        $logs = CommonLog::get_log();

        foreach($logs as $log_row) {

            $tmp = explode(": ", $log_row);
            $type = array_shift($tmp);
            $log_info = implode(": ", $tmp);

            if(!is_array($debug_info[$type])) {
                $debug_info[$type] = [];
            }

            array_push($debug_info[$type], $log_info);
        }

        $debug_info['REQUEST_URI'] = I('server.REQUEST_URI');
        $debug_info['REQUEST_METHOD'] = strtoupper($this->_method);

        // 索引数组
        if(is_assoc($data)) {
            $data['__DEBUG__'] = $debug_info;
        } else {
            $data[0]['__DEBUG__'] = $debug_info;
        }

        return $data;
    }

    public function __call($method,$args) {
        if( 0 === strcasecmp($method,ACTION_NAME.C('ACTION_SUFFIX'))) {
            if(method_exists($this,$method.'_'.$this->_method.'_'.$this->_type)) { // RESTFul方法支持
                $fun  =  $method.'_'.$this->_method.'_'.$this->_type;
                $this->$fun();
            }elseif($this->_method == $this->defaultMethod && method_exists($this,$method.'_'.$this->_type) ){
                $fun  =  $method.'_'.$this->_type;
                $this->$fun();
            }elseif($this->_type == $this->defaultType && method_exists($this,$method.'_'.$this->_method) ){
                $fun  =  $method.'_'.$this->_method;
                $this->$fun();
            }elseif(method_exists($this,'_empty')) {
                // 如果定义了_empty操作 则调用
                $this->_empty($method, $args);
            } else if(method_exists($this, $method)) {
                $this->$method();
//            }elseif(file_exists_case($this->view->parseTemplate())){
//                // 检查是否存在默认模版 如果有直接输出模版
//                $this->display();
            }else{
                E(L('_ERROR_ACTION_').':'.ACTION_NAME);
            }
        }
    }
    
}