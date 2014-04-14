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
        return L("Unnamed");
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

/**
 * 去除数组索引
 */
function reIndex($data) {
    foreach ($data as $v) {
        $tmp[] = $v;
    }
    return $tmp;
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
    $rs = delDirAndFile($path);
}
function delDirAndFile($dirName) {
    if ($handle = opendir("$dirName")) {
        while (false !== ( $item = readdir($handle) )) {
            if ($item != "." && $item != "..") {
                if (is_dir("$dirName/$item")) {
                    delDirAndFile("$dirName/$item");
                } else {
                    @ unlink("$dirName/$item");
                }
            }
        }
        @ closedir($handle);
        @ rmdir($dirName);
    }
}

/**
 * 
 */
function inExplodeArray($id, $ids, $split=",") {
    return in_array($id, explode($split, $ids));
}

function getCurrentUid() {
    return $_SESSION["user"]["id"];
}

/**
 * 汉字转拼音
 */
function getfirstchar($s0) {
    $fchar = ord($s0{0});
    if ($fchar >= ord("A") and $fchar <= ord("z"))
        return strtoupper($s0{0});
    $s1 = iconv("UTF-8", "gb2312", $s0);
    $s2 = iconv("gb2312", "UTF-8", $s1);
    if ($s2 == $s0) {
        $s = $s1;
    } else {
        $s = $s0;
    }
    $asc = ord($s{0}) * 256 + ord($s{1}) - 65536;
    if ($asc >= -20319 and $asc <= -20284)
        return "A";
    if ($asc >= -20283 and $asc <= -19776)
        return "B";
    if ($asc >= -19775 and $asc <= -19219)
        return "C";
    if ($asc >= -19218 and $asc <= -18711)
        return "D";
    if ($asc >= -18710 and $asc <= -18527)
        return "E";
    if ($asc >= -18526 and $asc <= -18240)
        return "F";
    if ($asc >= -18239 and $asc <= -17923)
        return "G";
    if ($asc >= -17922 and $asc <= -17418)
        return "H";
    if ($asc >= -17417 and $asc <= -16475)
        return "J";
    if ($asc >= -16474 and $asc <= -16213)
        return "K";
    if ($asc >= -16212 and $asc <= -15641)
        return "L";
    if ($asc >= -15640 and $asc <= -15166)
        return "M";
    if ($asc >= -15165 and $asc <= -14923)
        return "N";
    if ($asc >= -14922 and $asc <= -14915)
        return "O";
    if ($asc >= -14914 and $asc <= -14631)
        return "P";
    if ($asc >= -14630 and $asc <= -14150)
        return "Q";
    if ($asc >= -14149 and $asc <= -14091)
        return "R";
    if ($asc >= -14090 and $asc <= -13319)
        return "S";
    if ($asc >= -13318 and $asc <= -12839)
        return "T";
    if ($asc >= -12838 and $asc <= -12557)
        return "W";
    if ($asc >= -12556 and $asc <= -11848)
        return "X";
    if ($asc >= -11847 and $asc <= -11056)
        return "Y";
    if ($asc >= -11055 and $asc <= -10247)
        return "Z";
    return null;
}

function Pinyin($zh) {
    $ret = "";
    $s1 = iconv("UTF-8", "gb2312", $zh);
    $s2 = iconv("gb2312", "UTF-8", $s1);
    if ($s2 == $zh) {
        $zh = $s1;
    }
    for ($i = 0; $i < strlen($zh); $i++) {
        $s1 = substr($zh, $i, 1);
        $p = ord($s1);
        if ($p > 160) {
            $s2 = substr($zh, $i++, 2);
            $ret .= getfirstchar($s2);
        } else {
            $ret .= $s1;
        }
    }
    return $ret;
}

/**
 * 内置模块是否已启用
 */
function isModuleEnabled($moduleName) {
    return in_array($moduleName, C("ENABLED_MODULE"));
}
