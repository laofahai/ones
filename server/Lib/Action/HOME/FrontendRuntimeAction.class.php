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
                echo json_encode(combineI18n($runtime, $_GET["lang"]));
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