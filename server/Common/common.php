<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function getPwd($source) {
    return md5($source);
}
//用户缓存
function getUserCache() {
    $userData = F("User/All");
    if (!$userData) {
        $tmp = D("User")->select();
        foreach ($tmp as $v) {
            unset($v["password"]);
            $userData[$v["id"]] = $v;
        }
        F("User/All", $userData);
    }
    return $userData;
}

function getUserTruenameArray() {
    $users = getUserCache();
    foreach($users as $k=>$v) {
        $users[$k] = $v["truename"];
    }
    return $users;
}

function toDate($str, $format = "Y-m-d H:i:s") {
    return date($format, $str);
}
//根据UID返回用户真实姓名
function toTruename($uid) {
    if (!$uid) {
        return;
    }
    $userData = getUserCache();
    return $userData[$uid]["truename"];
}

//根据UID返回用户名
function toUsername($uid) {
    if (!$uid) {
        return L("Unnamed");
    }
    $userData = getUserCache();
    return $userData[$uid]["username"];
}

//数据库字段配置缓存
function makeDBConfigCache() {
    $config = F("Config/DB");
    if (!$config) {
        $model = D("Config");
        $tmp = $model->select();
        foreach ($tmp as $v) {
            $config[$v["alias"]] = $v["value"];
        }
    }
    return $config;
}
//字段配置调用
function DBC($name="") {
    $config = makeDBConfigCache();
    return $name ? $config[$name] : $config;
}

function strStartWith($searchIn, $key) {
    return substr($searchIn, 0, strlen($key)) == $key;
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
 * 语言包
 * **/
function lang($key, $data=array()) {

    $key = strtolower($key);

    $data = $data ? $data : F("i18n/".C("lang"));

    if(strtolower(substr($key, 0, 6) !== "urlmap") && $data["urlmap"]) {
        $data = $data["lang"];
    }

    $keys = explode(".", $key);

    //最终节点
    if(count($keys) === 1) {
        return $data[$keys[0]];
    }

    $tmpKey = array_shift($keys);

    if(!is_array($data[$tmpKey])) {
        return $data[$tmpKey];
    }

    return lang(implode(".", $keys), $data[$tmpKey]);

}

/**
 * 清除缓存
 */
function clearCache($type = 0, $path = NULL) {
    if (is_null($path)) {
        switch ($type) {
            case 0:// 模版缓存目录
                $path = CACHE_PATH;
                break;
            case 1:// 数据缓存目录
                $path = TEMP_PATH;
                break;
            case 2:// 日志目录
                $path = LOG_PATH;
                break;
            case 3:// 数据目录
                $path = DATA_PATH;
                break;
        }
    }
//    import("ORG.Io.Dir");
    delDirAndFile($path);
}
function delDirAndFile($dirName) {
    if ($handle = opendir($dirName)) {
        while (false !== ( $item = readdir($handle) )) {
            if ($item != "." && $item != "..") {
                if (is_dir($dirName."/".$item)) {
                    delDirAndFile($dirName."/".$item);
                } else {
                    unlink($dirName."/".$item);
                }
            }
        }
        @ closedir($handle);
        @ rmdir($dirName);
    }
}
/*
 * 强制删除目录
 * **/
function force_rmdir($path) {
    if (!file_exists($path)) return false;

    if (is_file($path) || is_link($path)) {
        return unlink($path);
    }

    if (is_dir($path)) {
        $path = rtrim($path, DS) . DS;

        $result = true;

        $dir = new DirectoryIterator($path);

        foreach ($dir as $file) {
            if (!$file->isDot()) {
                $result &= force_rmdir($path . $file->getFilename());
            }
        }

        $result &= rmdir($path);
        return $result;
    }
}
/*
 * 递归创建目录
 * **/
function mkdirs($dir) {
    if(!is_dir($dir)) {
        if(!mkdirs(dirname($dir))){
            return false;
        }
        if(!mkdir($dir,0777)){
            return false;
        }
    }
    return true;
}

/*
 * 生成日期序列
 * **/
function makeDateRange($start, $end, $step, $format = "m-d") {
    $tmp = range($start, $end, $step);
    foreach ($tmp as $v) {
        $dateRange[] = date($format, $v);
    }
    return $dateRange;
}

/*
 * 判断是否JSON
 * **/
function is_not_json($str){
    return is_null(json_decode($str));
}

/**
 * 
 */
function inExplodeArray($id, $ids, $split=",") {
    return in_array($id, explode($split, $ids));
}

function getArrayField($array, $field="id") {
    $return = array();
    foreach($array as $a) {
        $return[] = $a[$field];
    }

    return $return;
}

function getCurrentUid() {
    return $_SESSION["user"]["id"];
}

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
 * 汉字转拼音
 */
function Pinyin($word) {
    import("@.ORG.Pinyin.ChinesePinyin");
    $Pinyin = new ChinesePinyin();
    return $Pinyin->TransformUcwords($word);
}

/**
 * 内置模块是否已启用
 */
function isModuleEnabled($moduleName, $version="0", $compare=">=") {
    $modules = F("loadedApp");
    return array_key_exists($moduleName, $modules);
    return in_array(strtolower($moduleName), $modules);
}
function isAppLoaded($appName, $version="0", $compare=">=") {
    return isModuleEnabled($appName, $version, $compare);
}

/**
 * 生成原厂编码
 */
function makeFactoryCode($data, $factoryCode=null) {
    $format = DBC("goods.unique.template");
    $format = explode(",", $format);
    if($factoryCode) {
        $data["factory_code"] = $factoryCode;
    }
    foreach($format as $v) {
        if(!array_key_exists($v, $data)) {
            return false;
        }
        $result[] = $data[$v];
    }

    return implode(DBC("goods.unique.separator"), $result);
    
}

/*
 * 合併數組中相同的數據
 * **/
function mergeSameCodeRows($data, $uniqueField="factory_code_all,stock", $sumField="num") {
    $tmp = array();

    foreach($data as $k=>$v) {
        $uniqueKey = array();
        foreach(explode(",", $uniqueField) as $f) {
            $uniqueKey[] = $v[$f];
        }
        $uniqueKey = implode("---", $uniqueKey);

        if(isset($tmp[$uniqueKey])) {
            $tmp[$uniqueKey][$sumField] += $v[$sumField];
        } else {
            $tmp[$uniqueKey] = $v;
        }
    }

    return reIndex($tmp);
}

/*
 * 过滤数组中的数据
 * **/
function filterDataFields($data, $fields) {
    $result = array();
    foreach($data as $k=>$v) {
        if(in_array($k, $fields)) {
            $result[$k] = $v;
        }
    }
    return $result;
}

/*
 * 记录数据库错误
 * **/
function LogSQLError($model, $rollback=false) {
    Log::write("SQL Error:".$model->getLastSql(), Log::SQL);
    if($rollback) {
        $model->rollback();
    }
}


/**
 * 检查数组数据是否完整
 */
function checkParamsFull($data, $needed) {
    foreach($needed as $v) {
        if(!array_key_exists($v, $data)) {
            return false;
        }
    }
    return true;
}
function checkParamsFullMulti($data, $needed) {
    foreach($data as $row) {
        if(!checkParamsFull($row, $needed)) {
            return false;
        }
    }
    return true;
}

/**
 * 发送邮件
 */
function sendMail($subject, $to, $toName, $content, $attach=array()) {
    import("@.ORG.phpmailer.Mail");
    $mail = new PHPMailer(); //实例化 
    $mail->IsSMTP(); // 启用SMTP 
    $mail->Host = DBC("mail.smtp"); //SMTP服务器 以163邮箱为例子
    $mail->Port = C("MAIL_SMTP_PORT") ? C("MAIL_SMTP_PORT") : 25;  //邮件发送端口 
    $mail->SMTPAuth   = true;  //启用SMTP认证 

    $mail->CharSet  = C("MAIL_CHARSET"); //字符集 
    $mail->Encoding = C("MAIL_ENCODE") ? C("MAIL_ENCODE") : "base64"; //编码方式 

    $mail->Username = DBC("mail.login");  //你的邮箱
    $mail->Password = DBC("mail.password");  //你的密码
    $mail->Subject = $subject; //邮件标题 

    $mail->From = DBC("mail.address");  //发件人地址（也就是你的邮箱）
    $mail->FromName = DBC("mail.from");  //发件人姓名

    $mail->AddAddress($to, $toName);//添加收件人（地址，昵称） 
    
    if($attach) {
        foreach($attach as $a) {
            $rs = $mail->AddAttachment($a); // 添加附件,并指定名称 
            if(!$rs) {
                return $mail->ErrorInfo;
            }
        }
    }
    $mail->IsHTML(true); //支持html格式内容 
    $mail->Body = $content;
    if(!$mail->Send()) { 
        return $mail->ErrorInfo; 
    } else { 
        return true;
    } 
    
}

/**
 * 数据库备份
 * @require sendMail
 * @require php_zip
 * @require mysql_dump
 */
function DBBackup($options=array()) {
    set_time_limit(60);
    $savename = $options["savename"] ? $options["savename"] : sprintf("%s/Data/Backup/DB_Backup_%s.sql", ENTRY_PATH, date("YmdHis", CTS));
    $command = sprintf("%smysqldump %s -u %s -p%s > %s",
                    C("MYSQL_BIN"),
                    C("DB_NAME"),
                    C("DB_USER"),
                    C("DB_PWD"),
                    $savename
                );
//    echo $command;exit;
    exec($command);
    if(in_array("zip", $options)) {
        sleep(2);
        $zip = new ZipArchive;
        $zipname = str_replace(".sql", ".zip", $savename);
        if ($zip->open($zipname, ZIPARCHIVE::CREATE) === true) {
            $zip->addFile($savename, basename($savename));
            $zip->close();
        } else {
            return false;
        }
    }
    
    if(in_array("sendmail", $options)) {
        sleep(2);
        $file = in_array("zip", $options) ? $zipname : $savename;
        $content = <<<EOF
        From: {$_SERVER["HTTP_HOST"]} - {$_SERVER["HTTP_REFERER"]}
EOF;

        $rs = sendMail("ONES DBBackup", DBC("backup.sendto.email"), "ONES Customer", $content, array($file));
        if(true !== $rs) {
            return $rs;
        }
    }
    if(in_array("autodelete", $options)) {
        @unlink($savename);
        @unlink($zipname);
    }
    return true;
//        $rs = sendMail("hello", "dk_nemo@163.com", "老大", '123123', array(
//            "/Users/nemo/wwwroot/newopenx/erp_server/1.zip"
//        ));
//        var_dump($rs);
////        echo 123;exit; 
}

/**
 * 生成单据编号
 */
function makeBillCode($prefix){
    $str = "QWERTYUIOPASDFGHJKLZXCVBNM";
    return substr($prefix,0,2).$str[intval(date('Y'))-2014].
    strtoupper(dechex(date('mdH'))).
    substr(microtime(),2,5).sprintf('%02d',rand(100,999));
}

function finalTrim($str) {
    $str = str_replace(
        array("    ", "\n", " :", ": ", " ,",", "),
        array("", "", ":", ":", ",", ","),
        $str
    );
    return $str;
}

/*
 * 目录复制
 * **/
function recursionCopy($src,$dst) {  // 原目录，复制到的目录

    $dst = realpath($dst);
    $src = realpath($src);

    $dir = opendir($src);
    $ignore = array(
        ".",
        "..",
        ".DS_Store",
        "__MACOSX"
    );
    while(false !== ( $file = readdir($dir)) ) {

        if (!in_array($file, $ignore)) {
            if ( is_dir($src . '/' . $file) ) {
                if(!is_dir($dst . '/' . $file)) {
                    mkdir($dst . '/' . $file, 0777);
                }
                recursionCopy($src . '/' . $file, $dst . '/' . $file);
            }
            else {
                $rs = copy($src . '/' . $file,$dst . '/' . $file);
            }
        }
    }
    closedir($dir);
}

/*
 * 导入SQL
 * **/
function importSQL($sqlPath) {

    $sqls = file_get_contents($sqlPath);

    $sqls = explode("-- separator", $sqls);

    $model = M();
    foreach($sqls as $sql) {
        $sql = str_replace(array(
            "[PREFIX]",
            "\n"
        ), array(
            C("DB_PREFIX"),
            " "
        ), $sql);
//        echo $sql;exit;
        $sql = trim($sql);
        if(!$sql) {
            continue;
        }
        if(false === $model->execute($sql)) {
            return array($model->getDbError(), $sql);
        }
    }

    return true;
}

/**
 * 统一处理的类型
 * **/
function getTypes($type) {
    $types = F("Types");
    if(!$types) {
        $tmp = D("Types")->order("listorder DESC,id ASC")->select();
        foreach($tmp as $v) {
            $types[$v["type"]][] = $v;
        }
        F("Types", $types);
    }
    return $types[$type];
}

function getTypesIndex($type, $idField="id", $field="name") {
    $types = getTypes($type);
    foreach($types as $k=>$v) {
        $tmp[$v[$idField]] = $v[$field];
    }
    return $tmp;
}
function getTypeByAlias($type, $alias) {
    $types = getTypes($type);
    foreach($types as $t) {
        if($t["alias"] == $alias) {
            return $t;
        }
    }
}
function getTypeIdByAlias($type, $alias) {
    $types = getTypes($type);
    foreach($types as $t) {
        if($t["alias"] == $alias) {
            return $t["id"];
        }
    }

    return 0;
}

//单据详情格式化
function detailRowsReadFormat($rows) {

    $modelIds = array();
    $rowData = array();
    foreach($rows as $v) {
        $tmp = explode(DBC("goods.unique.separator"), $v["factory_code_all"]); //根据factory_code_all factory_code - standard - version
        $factory_code = array_shift($tmp);
        $modelIds = array_merge($modelIds, $tmp);

        $v["stock"] = $v["stock_id"];
        $v["stock_label"] = $v["stock_name"];
        $v["modelIds"] = $tmp;
        $v["goods_id"] = sprintf("%s_%s_%s", $factory_code, $v["goods_id"], $v["goods_category_id"]); // factory_code, id, catid
        $v["goods_id_label"] = $v["goods_name"];
        $rowData[$v["id"]] = $v;
    }

    return reIndex($rowData);
}

/*
 * PHP5.3以下版本并无内置lcfirst函数
 * **/
if(false === function_exists('lcfirst'))
{
    /**
     * Make a string's first character lowercase
     *
     * @param string $str
     * @return string the resulting string.
     */
    function lcfirst( $str ) {
        $str[0] = strtolower($str[0]);
        return (string)$str;
    }
}

/*
 * 返回整合的语言包
 * **/
function langToLower($match) {
    return sprintf('"%s":', strtolower($match[1]));
}
function combineI18n($runtimeObj, $lang = "zh-cn") {
    $data = $runtimeObj->preloadI18n($lang);
    $data = $runtimeObj->combineI18n(false, $data, $lang);

    return $data;
}


function checkAppRequirements($requirements) {

    $loadedApps = F("loadedApp");

    $lost = array();

    if(!$requirements) {
        return true;
    }

    foreach($requirements as $app=>$cond) {
        list($compare, $version) = explode(" ", $cond);

        if(!array_key_exists($app, $loadedApps) && $app !== "ones") {
            $lost[] = $app;
            continue;
        }

        $currentVersion = $loadedApps[$app];
        if($app == "ones") {
            $currentVersion = DBC("system.version");
        }


        //当前为判断系统版本
        if($app === "ones") {
            if(!version_compare($currentVersion, $version, $compare)) {
                if($app === "ones") {
                    return array(
                        "ones" => $compare.$version
                    );
                } else {
                    $lost[] = sprintf("%s %s v%s needed.", $app, $compare, $version);
                }
            }

        }
    }

    return $lost ? $lost : true;

}

function getPrimaryApps($includeVersion=false) {
    $apps = array(
        "dataModel",
        "department",
        "firstTimeWizard",
        "install",
        "multiSearch",
        "services",
        "workflow",
        "dashboard"
    );
    if(!$includeVersion) {
        return $apps;
    }

    foreach($apps as $v) {
        $return[$v] = "0.0.0";
    }
    return $return;
}
function isPrimaryApp($app) {
    return in_array($app, getPrimaryApps());
}