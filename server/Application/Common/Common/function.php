<?php

/*
 * 返回当前登录用户所属公司ID
 * **/
function get_current_company_id() {
    $company = D('Account/UserInfo')->get_current_company();
    return $company ? $company['id'] : false;
}

/*
 *
 * */
function get_current_user_id() {
    $user = D('Account/UserInfo')->get_current_user();
    return $user['id'] ? $user['id'] : false;
}

/**
 * 检查数组数据是否完整
 * @param $data 源数据
 * @param $needed 所需字段
 * @param $only_check_key 是否仅检测数组索引是否存在
 */
function check_params_full($data, $needed, $only_check_key=false) {
    $not_checked = [];
    foreach($needed as $v) {
        if($only_check_key) {
            if(!array_key_exists($v, $data)) {
                $not_checked[$v] = $v;
            }
        } else {
            if(!$data[$v]) {
                $not_checked[$v] = $v;
            }
        }
    }

    if($not_checked) {
        return $not_checked;
    }
    return true;
}
function check_params_full_multi($data, $needed, $only_check_key=false) {
    foreach($data as $row) {
        $result = checkParamsFull($row, $needed, $only_check_key);
        if($result !== true) {
            return $result;
        }
    }
    return true;
}

/*
 * 处理decimal字段小数位
 * */
function decimal_scale($value) {
    $scale = DBC('decimal_scale');
    $scale = $scale ? $scale : 2;
    return sprintf('%.'.$scale.'f', $value);
}

function DBC($alias = null) {
    $cache_key = get_company_cache_key('db_config');
    $cached = F($cache_key);
    if(DEBUG || !$cached) {
        $cached = D('Home/Config', 'Service')->get_kv_config();
        $cached = get_array_to_kv($cached, 'val', 'alias');
        F($cache_key, $cached);
    }

    return $alias ? $cached[$alias] : $cached;
}

// 生成随机字符串
function random_string($length) {
    $str = null;
    $strPol = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
    $max = strlen($strPol)-1;

    for($i=0;$i<$length;$i++){
        $str.=$strPol[rand(0,$max)];
    }

    return $str;
}

function parse_yml($file) {
    return (array)\Symfony\Component\Yaml\Yaml::parse(file_get_contents($file));
}

/*
 * unix gettext like
 * **/
function __($msgid) {
    $cacheId = sprintf('lang/%s/all', CURRENT_LANGUAGE);
    $lang = F($cacheId);

    $msgIds = explode('.', $msgid);
    $last = end($msgIds);
    if(DEBUG || !$lang) {
        $lang = Home\Event\I18nEvent::make_i18n_cache($cacheId);
    }

    $app = array_shift($msgIds);
    if(!$lang[$app]) {
        if($app == 'common') {
            return $last;
        }
        $app = 'common';
    }

    $lang = $lang[$app];

    for($i=0;$i<count($msgIds);$i++) {
        if($lang[$msgIds[$i]]) {
            $lang = $lang[$msgIds[$i]];
        } else {
            if($app == 'common') {
                return $last;
            }
            return __('common.'. implode('.', $msgIds));
        }
    }
    
    return $lang;   
}
/*
 * 从js对象转换为mysql datetime or timestamp
 * */
function format_form_js_date($source, $format=false) {
    if(!$source) {
        return "";
    }
    $result = strtotime($source);
    if(true === $format) { //timestamp
        return $result;
    }

    $format = $format ? $format : 'Y-m-d H:i:s';
    return date($format, $result);
}

/**
 * 去除数组索引
 */
function reIndex($data) {
    foreach ($data as $v) {
        $tmp[] = $v;
    }
    return $tmp;
}

/*
 * 是否关联数组
 * **/
function is_assoc($array){
    return array_keys($array) !== range(0, count($array) - 1);
}

/*
 * 删除数组元素
 * */
function remove_array_items(&$array, $items) {
    $items = is_array($items) ? $items : [$items];
    foreach($array as $k=>$v) {
        if(in_array($v, $items)) {
            unset($array[$k]);
        }
    }
}

/*
 * 返回数组中某字段的数组
 * @param array $array
 * @param string $field
 * **/
function get_array_by_field($array, $field) {
    $data = array();
    foreach($array as $a) {
        if(isset($a[$field])) {
            $data[] = $a[$field];
        }
    }
    return $data;
}

/*
 * 将数组转为k=>v 一维数组
 * */
function get_array_to_kv($array, $value_field, $id_field='id') {
    $return = array();
    foreach($array as $k=>$v) {
        $return[$v[$id_field]] = $v[$value_field];
    }
    return $return;
}


/*
 * 转为多为数组内某字段为索引的关联数组
 * */
function get_array_to_ka($array, $index_field="id") {
    $return = array();
    foreach($array as $k=>$v) {
        $return[$v[$index_field]] = $v;
    }
    return $return;
}

/*
 * 根据某字段将数组分组
 * */
function get_array_by_group($array, $group_field) {
    $return = [];
    foreach($array as $row) {
        $group_value = $row[$group_field];
        if(!array_key_exists($group_value, $return)) {
            $return[$group_value] = [];
        }
        array_push($return[$group_value], $row);
    }
    return $return;
}

/*
 * 过滤数组中的字段
 * */
function filter_array_fields($array, $fields) {

    if(!$fields) {
        return [];
    }

    if(!is_array($fields)) {
        $fields = [$fields];
    }

    $return = array();
    foreach($array as $k=>$v) {
        if(in_array($k, $fields)) {
            $return[$k] = $v;
        }
    }
    return $return;
}

function filter_array_fields_multi($array, $fields) {
    foreach($array as $k=>$v) {
        $array[$k] = filter_array_fields($v, $fields);
    }
    return $array;
}

/*
 * 多维数组排序
 * @param array $multi_array 需排序数组
 * @param string $sort_key 指定排序字段
 * @param integer $sort 排序方式，可选SORT_DESC, SORT_ASC
 * */
function multi_array_sort($multi_array,$sort_key,$sort=SORT_DESC){
    if(is_array($multi_array)){
        foreach ($multi_array as $row_array){
            if(is_array($row_array)){
                $key_array[] = $row_array[$sort_key];
            }else{
                return -1;
            }
        }
    }else{
        return -1;
    }
    array_multisort($key_array,$sort,$multi_array);
    return $multi_array;
}

/**
 * 转驼峰命名
 * */
function camelCase($str){
    return preg_replace_callback('/[-_]+(.)?/', function($matches) {
        $search = array(
            '_',
            ' ',
            '-'
        );
        return strtoupper(str_replace($search, '', $matches[0]));
    }, ucfirst($str));
}
function camelCaseSpace($str){
    $result = ucfirst(preg_replace_callback('/[-_]+(.)?/', function($matches) {
        $search = array(
            '_',
            ' ',
            '-'
        );
        preg_replace("/([A-Z])/", " \$1", $matches[0]);
        return $matches[0];
    },$str));

    return preg_replace("/(.+)([A-Z])/U", "$1 \$2", $result);
}

/*
 * 模型(模块)别名转换为真实的ThinkPHP style模型名称
 * eg: storage.stockIn => Storage/StockIn
 * */
function model_alias_to_name($alias) {
    list($app, $module) = explode('.', $alias);

    if(!$alias || !$app || !$module) {
        return;
    }

    return sprintf('%s/%s', ucfirst($app), ucfirst($module));
}
function model_name_to_alias($name) {
    list($app, $module) = explode('/', $name);

    return sprintf('%s.%s', lcfirst($app), lcfirst($module));
}
/*
 * 根据模块别名返回其I18N名称
 * */
function model_alias_to_label($alias) {

    if(!$alias) {
        return '';
    }

    list($app, $module) = explode('.', $alias);

    return __($app.'.'.camelCaseSpace($module));
}

function model_name_to_table_name($model_name) {
    return strtolower(preg_replace('/((?<=[a-z])(?=[A-Z]))/', '_', $model_name));
}

/*
 * 自动生成单据标题
 * */
function auto_make_bill_subject(&$data) {
    if($data['subject']) {
        return $data['subject'];
    }

    $data['subject'] = model_alias_to_label($data['source_model']);
    if($data['bill_no']) {
        $data['subject'] .= ' '.$data['bill_no'];
    }

    return $data['subject'];
}

/*
 * 转关联数组
 * */
function to_assoc($array) {
    $return = array();
    foreach($array as $a) {
        $return[$a] = $a;
    }
    return $return;
}

/*
 * 处理POST的item_select 字段 ID
 * */
function process_with_item_select_ids($field, $multi=false) {
    $data = $_POST[$field];

    if(!$data) {
        return null;
    }

    if(!is_array($data)) {
        $data = explode(',', $data);
    }

    return $multi ? implode(',', $data) : $data[0];
}

function get_company_cache_key($key) {
    return 'company/'.get_current_company_id().'/'.$key;
}