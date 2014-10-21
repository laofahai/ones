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

class FrontEndRuntime {

    public $loadedApps = array();

    private $whiteList = array("main.js", "config.json");

    private $preLoadingList;

    private $afterLoadingList = array(
        "lib/commonView.js",
    );

    private $javascripts;

    private $blackList = array(
        ".",
        "..",
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

    private $baseDir;

    private $included = array();

    public $unfoundApp = array();

    public function __construct($loadedApps) {
        $this->baseDir = ROOT_PATH."/common";
        $this->loadedApps = $loadedApps;

        $this->preLoadingList = C("preloadJS".(APP_DEBUG ? "DEBUG": ""));

    }

    private function response($data) {
        echo $this->doTrim($data);
    }

    public function echoJS($file) {
        header("Content-Type:application/javascript;charset=utf-8");
        $find = array(
            "'[ones.requirements.placeholder]'"
        );
//        foreach($this->loadedApps as $app) {
//            $loadedApps[] = "ones.".$app;
//        }
        $replace = array(
            sprintf("'ones.%s'", implode("','ones.", $this->loadedApps)),
        );

        $file = ROOT_PATH."/".$file;
        if(is_file($file)) {
            echo $this->doTrim(str_replace($find, $replace, file_get_contents($file)));
        }
    }


    public function preloadJS() {
        foreach($this->preLoadingList as $pre) {
            $tmp = $this->baseDir."/".$pre;
            if(is_file($tmp)){
                $js[] = $this->javascripts[] = "common/".$pre;
            }
        }
        return $js;
    }

    public function afterLoadJS() {
        foreach($this->afterLoadingList as $af) {
            $tmp = $this->baseDir."/".$af;
            if(is_file($tmp)){
                $js[] = $this->javascripts[] = "common/".$af;
            }
        }
        return $js;
    }

    public function preloadI18n($lang) {
        $content = file_get_contents($this->baseDir."/i18n/".$lang.".json");
        return json_decode($content, true);
    }

    /*
     * 合并并返回APP i18n
     * **/
    public function combineI18n($dir=false, $langData = array(), $lang) {
        $langData = $langData ? $langData : array();
        foreach($this->loadedApps as $app) {
            $langFile = sprintf("%s/apps/%s/i18n/%s.json", ROOT_PATH, $app, $lang);
            if($langFile && !is_file($langFile)) {
                continue;
            }

            $tmpLang = json_decode(file_get_contents($langFile), true);
            if(is_array($tmpLang) && $tmpLang) {
                $langData = array_merge_recursive($langData, $tmpLang);
            }

        }
        return $langData;
    }

    public function combineJS($dir=false, $require=false) {
        $dir = $dir ? $dir : ROOT_PATH."/apps";
        if($require && !is_dir($dir)) {
            $tmp = end(explode("/", $dir));
            $this->unfoundApp[$tmp] = $tmp;
            return;
        }

        if(!is_dir($dir)) {
            return;
        }
        $js = array();
        if ($dh = opendir($dir)) {
            while (($app = readdir($dh)) !== false) {

                if(!in_array($app, $this->loadedApps)) {
                    continue;
                }

                $appPath = $dir."/".$app;
                $js = array_merge($js, (array)$this->loadAppStatic($appPath, $app));

            }
            closedir($dh);
        }
        $this->combineAppConfig();

        return $js;
    }

    public function doTrim($code) {
        $code = str_replace(array(
            "    ", "'use strict';", "'use strict'",
            "\t",
        ), "", $code);

        $code = preg_replace("/\s\/\/.*/", "", $code);
        $code = preg_replace("/\/\*.*\*\//sU", "", $code);
        $code = preg_replace("/\n\n/", " ", $code);

        return $code;
    }

    public function parseConfig() {}

    public function setWhiteList() {}

    public function debug() {
        print_r($this->included);
    }

    private function loadAppStatic($appPath, $app) {
        $js = array();
        $basePath = "apps/".$app."/";
        $appDH = opendir($appPath);
        while(($appFile = readdir($appDH)) !== false) {
            if(in_array($appFile, $this->blackList)) {
                continue;
            }
            $tmpPath = $appPath."/".$appFile;
            $tmpConfigPath = $appPath."/config.json";

            if(!is_dir($tmpPath)) {
                //配置文件
                if(is_file($tmpConfigPath) && !in_array($tmpConfigPath, $this->included)) {
                    $this->included[md5($tmpConfigPath)] = $tmpConfigPath;
                    $tmp = finalTrim(file_get_contents($appPath."/config.json"));
                    $tmpConfig = json_decode($tmp, true);
                    $this->appConfigJson[$app] = $tmpConfig;
                    //优先加载依赖文件
                    if($tmpConfig["requirements"]) {
                        foreach($tmpConfig["requirements"] as $dep) {
                            if(!in_array($dep, $this->loadedApps)) {
                                $this->unfoundApp[$dep] = $dep;
                                continue;
                            }
                            $depPath = dirname($appPath)."/".$dep;
                            $js = array_merge($js, (array)$this->loadAppStatic($depPath, $dep));
                        }
                    }
                    if($tmpConfig["alias"] && is_file($appPath."/main.js")) {
//                            $this->loadedApps[$tmpConfig["alias"]] = "ones.".$tmpConfig["alias"];
                    }
                }
                if(!in_array($tmpPath, $this->included)) {
                    if(end(explode(".", $tmpPath)) === "js") {
                        $js[] = $this->javascripts[] = $basePath.basename($tmpPath);
                    }
                    $this->included[md5($tmpPath)] = $tmpPath;
                }
            }
        }

        closedir($appDH);

        return $js;
    }

    private function combineAppConfig() {
//        echo sprintf("ones.LoadedAppsConfig=angular.fromJson('%s');", json_encode($this->appConfigJson));
    }

    public function combineCSS($dir=null) {
        $dir = $dir ? $dir : ROOT_PATH."/apps";
        header("Content-Type:text/css;charset=utf-8");
        if ($dh = opendir($dir)) {
            while (($app = readdir($dh)) !== false) {

                if(!in_array($app, $this->loadedApps)) {
                    continue;
                }

                $cssPath = $dir."/".$app."/statics/style.css";
                if(is_file($cssPath)) {
                    echo $this->doTrimCss(file_get_contents($cssPath));
                }

            }
            closedir($dh);
        }
    }

    public function getJavascripts($split=false) {
        $result = array();
        $result["pre"] = $this->preloadJS();
        $result["app"] = $this->combineJS();
        $result["after"] = $this->afterLoadJS();
        return $split ? $result : $this->javascripts;
    }

    public function jsEntry() {

    }

    private function doTrimCss($content) {
        return str_replace(array(
            "\n"
        ), "", $content);
    }

}

