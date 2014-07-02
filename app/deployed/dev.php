<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 14-7-2
 * Time: 13:49
 *
 * 自动生成开发时的运行时JS
 */
error_reporting(0);

function doTrim($code) {
    $code = str_replace(array(
        "    ", "'use strict';", "'use strict'",
        "\t",
    ), "", $code);
    return $code;
}

function combineJS($path="") {
    $blackList = array(
        ".",
        "..",
        "i18n",
        ".DS_Store",
        ".jshintrc",
        "__MACOS",
        "app.js",
        "login.js",
        "config.js",
        "function.js",
        "formMaker.js",
        "commonView.js"
    );
    $dir = $path ? $path : dirname(dirname(__FILE__))."/scripts";
    if(!is_dir($dir)) {
        return;
    }

    if ($dh = opendir($dir)) {
        while (($file = readdir($dh)) !== false) {
            if(in_array($file, $blackList)) {
                continue;
            }
            if((is_dir($dir."/".$file))) {
                combineJS($dir."/".$file);
            } else {
                if(substr($file, strlen($file)-3, 3) !== ".js") {
                    return;
                }
                echo doTrim(file_get_contents($dir."/".$file));
            }
        }

        closedir($dh);
    }
}

function getJS() {
    header("Content-Type:application/javascript;charset=utf-8");
    $path = dirname(dirname(__FILE__))."/scripts";
    $code = file_get_contents($path."/lib/function.js")
        .file_get_contents($path."/lib/formMaker.js")
        .file_get_contents($path."/app.js")
        .file_get_contents($path."/lib/commonView.js");
    echo doTrim($code);
    combineJS($path);
}

function makeFile($fileName) {}


switch($_GET["act"]) {
    case "makeJSFile":
        ob_start();
        getJS();
        $contents = ob_get_contents();
        ob_end_clean();
    default:
        getJS();
        break;
}






