<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 14-7-19
 * Time: 0:37
 */

class FrontendRuntimeAction extends CommonAction {

    public function index() {
        import("@.ORG.staticRuntime");
        $loadedApps = F("loadedApp");
        $runtime = new FrontEndRuntime($loadedApps);

        switch($_GET["action"]) {
            case "getI18n":

                header("Content-Type:application/json;charset=utf-8");
                $lang = $_GET["lang"] ? $_GET["lang"] : C("lang");

                $i18n = F("i18n/".$lang);

//                if(!$i18n) {
                    $i18n = combineI18n($runtime, $lang);
                    F("i18n/".$lang, $i18n);
//                }

                $i18n = json_encode($i18n);


//                preg_match_all('/\"([a-zA-Z0-9\.\_\- ]+)\":/', $i18n, $matches);
                function langToLower($match) {
                    return sprintf('"%s":', strtolower($match[1]));
                }
                echo preg_replace_callback('/\"([a-zA-Z0-9\.\_\- ]+)\":/', "langToLower", $i18n);exit;

                var_dump($matches);exit;
                break;
            case "getCss":
                header("Content-Type:text/css;charset=utf-8");
                $data = $runtime->combineCSS();
                break;
            default:
                header("Content-Type:application/javascript;charset=utf-8");
                ob_start();
                $runtime->combineJS();
                $content = ob_get_contents();
                ob_end_clean();
                $runtime->preloadJS();
                echo $content;
                $runtime->afterLoadJS();
                if($runtime->unfoundApp) {
                    echo sprintf("ones.unfoundApp=['%s'];", implode("','", $runtime->unfoundApp));
                }

                break;
        }


    }

    public function read() {
        $file = $_GET["file"];
        import("@.ORG.staticRuntime");
        $loadedApps = F("loadedApp");
        $runtime = new FrontEndRuntime($loadedApps);
        $runtime->echoJS($file);
    }

} 