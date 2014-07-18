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
                $data = $runtime->preloadI18n($_GET["lang"]);
                $data = $runtime->combineI18n(false, $data, $_GET["lang"]);
                echo json_encode($data);
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

} 