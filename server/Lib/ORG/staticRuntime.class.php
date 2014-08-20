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


    public function preloadJS() {
        $find = array(
            "'[ones.requirements.placeholder]'",
            "'[ones.loadedApps.placeholder]'"
        );
        foreach($this->loadedApps as $app) {
            $loadedApps[] = "ones.".$app;
        }
        $replace = array(
            sprintf("'%s'", implode("','", $loadedApps)),
            sprintf("'%s'", implode("','", $loadedApps)),
        );
        foreach($this->preLoadingList as $pre) {
            $tmp = $this->baseDir."/".$pre;
            if(is_file($tmp)){
                $content = file_get_contents($tmp);
                $content = str_replace($find, $replace, $content);
                $this->response($content);
            }
        }
    }

    public function afterLoadJS() {
        foreach($this->afterLoadingList as $af) {
            $tmp = $this->baseDir."/".$af;
            if(is_file($tmp)){
                $content = file_get_contents($tmp);
//                $content = str_replace($find, $replace, $content);
                $this->response($content);
            }
        }
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
        if ($dh = opendir($dir)) {
            while (($app = readdir($dh)) !== false) {

                if(!in_array($app, $this->loadedApps)) {
                    continue;
                }

                $appPath = $dir."/".$app;
                $this->loadAppStatic($appPath, $app);

            }
            closedir($dh);
        }
        $this->combineAppConfig();

        return $this->loadedApps;
    }

    public function doTrim($code) {
        $code = str_replace(array(
            "    ", "'use strict';", "'use strict'",
            "\t",
        ), "", $code);
        return $code;
    }

    public function parseConfig() {}

    public function setWhiteList() {}

    public function debug() {
        print_r($this->included);
    }

    private function loadAppStatic($appPath, $app) {
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
                            $this->loadAppStatic($depPath, $dep);
                        }
                    }
                    if($tmpConfig["alias"] && is_file($appPath."/main.js")) {
//                            $this->loadedApps[$tmpConfig["alias"]] = "ones.".$tmpConfig["alias"];
                    }
                }
                if(!in_array($tmpPath, $this->included)) {
                    if(end(explode(".", $tmpPath)) === "js") {
                        $this->response(file_get_contents($tmpPath));
                    }
                    $this->included[md5($tmpPath)] = $tmpPath;
                }
            }
        }

        closedir($appDH);
    }

    private function combineAppConfig() {
        echo sprintf("ones.LoadedAppsConfig=angular.fromJson('%s');", json_encode($this->appConfigJson));
    }

    public function combineCSS($dir=null) {
        $dir = $dir ? $dir : ROOT_PATH."/apps";
        if ($dh = opendir($dir)) {
            while (($app = readdir($dh)) !== false) {

                if(!in_array($app, $this->loadedApps)) {
                    continue;
                }

                $cssPath = $dir."/".$app."/"."style.css";
                if(is_file($cssPath)) {
                    echo $this->doTrimCss(file_get_contents($cssPath));
                }

            }
            closedir($dh);
        }
    }

    private function doTrimCss($content) {
        return str_replace(array(
            "\n"
        ), "", $content);
    }

}

