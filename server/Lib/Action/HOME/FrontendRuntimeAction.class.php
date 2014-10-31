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

                if(!$i18n) {
                    $cached = false;
                    $i18n = combineI18n($runtime, $lang);
                }

                $i18n = json_encode($i18n);

                $i18n = preg_replace_callback('/\"([a-zA-Z0-9\.\_\- ]+)\":/', "langToLower", $i18n);

                echo $i18n;

                if(!$cached) {
                    $i18n = json_decode($i18n, true);
                    F("i18n/".$lang, $i18n);
                }

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

        import("@.ORG.staticRuntime");
        $loadedApps = F("loadedApp");

        $runtime = new FrontEndRuntime($loadedApps);

        if(isset($_GET["compileJS"])) {

            import("@.ORG.staticRuntime");
            $runtime = new FrontEndRuntime($loadedApps);

            $javascripts = $runtime->getJavascripts();

            foreach($javascripts as $js) {
                $runtime->echoJS($js);
            }

        } else if(isset($_GET["js"])) {
            $file = $_GET["js"];
            $runtime->echoJS($file);
        }


    }

} 