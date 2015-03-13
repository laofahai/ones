<?php

class IndexAction extends CommonAction {

    public function index() {

        if(!is_file(APP_PATH."/Data/install.lock")) {
//            $this->display("install");
            return;
        }

        $this->assign("isDebug", APP_DEBUG ? 'true' : 'false');
        $this->assign("APP_DEBUG", APP_DEBUG);

        $this->assign("siteTitle", DBC("site.title"));

        $loadedApps = F("loadedApp");
        $loadedApps = array_merge($loadedApps, getPrimaryApps(true));

        unset($loadedApps["install"]);

        $this->assign("loadedAppsStr", json_encode($loadedApps));

        //静态资源
        import("@.ORG.staticRuntime");
        $runtime = new FrontEndRuntime($loadedApps);

        if(!APP_DEBUG) {
            $javascripts = array(
                U('FrontendRuntime/read?compileJS=compile.js')
            );
        } else {
            $javascripts = $runtime->getJavascripts();
        }

        $javascripts[] = U('FrontendRuntime/read?js=common/base/app.js');

        $this->assign("javascripts", $javascripts);

        if($this->isLogin()) {
            $this->assign("APP_PATH", str_replace("index.php", "", __APP__));
            $this->assign("userInfo", json_encode($this->user));
            $this->display("app");
        } else {
            $this->display("login");
        }
    }

    public function read(){
        unset($_SESSION["user"]["password"]);

        $auth = new Auth();
        $rules = $auth->getAuthList(getCurrentUid());
//        print_r($rules);exit;

        $data = array(
            "authed" => reIndex($rules),
            "navs" => $this->makeNav(),
//            "user" => $_SESSION["user"]
        );

        $this->response($data);
    }

    /**
     * 根据AuthRule生成左侧导航，不同用户生成不同缓存
     * @todo 三级分类（快捷导航）
     */
    private function makeNav() {
        $navs = F("Nav/".$this->user["id"]);
        if($navs) {
            return $navs;
        }
        
        $navs = require APP_PATH."Conf".DS."navs.php";

        $appConf = $this->getAppConfig();

//        print_r($appConf);exit;

        $navs = array_merge_recursive($navs, $appConf["navs"]);

        import("@.ORG.Auth");

        foreach($navs as $rootLabel => $data) {
            $theChild = array();
            //二级菜单
            foreach($data["childs"] as $childLabel => $childData) {
                $theThird = array();
                // 包含三级菜单
                if(is_array($childData)) {
                    foreach($childData as $thirdLabel => $thirdUrl) {
                    	list($thirdData, $thirdIcon) = explode(",", $thirdUrl);
                    	if($thirdLabel == "icon") {
                    		continue;
                    	}
                        if($this->checkNavPermission($thirdData)) {
                            $theThird[] = array(
                                "label" => $thirdLabel,
                                "url"   => $thirdData,
                            	"icon"  => $thirdIcon,
                                "id"    => md5($thirdData.$thirdLabel)
                            );
                        } else {
//                            print_r($thirdData);
                        }
                    }
                }
                
                if($theThird) {
                    $theChild[$childLabel]["childs"] = $theThird;
                    if($childData["icon"]) {
                    	$theChild[$childLabel]["icon"] = $childData["icon"];                    	
                    }
                    $childUrl = $childData;
                } else {
                	list($childUrl, $childIcon) = explode(",", $childData);
                    $tmpRs = $this->checkNavPermission($childUrl);
                    if($tmpRs) {
                        $theChild[$childLabel]["url"] = $childUrl;
                        $theChild[$childLabel]["icon"] = $childIcon;
                    }
                }
                if($theThird or $tmpRs) {
                    $theChild[$childLabel]["label"] = $childLabel;
                    $theChild[$childLabel]["id"] = md5($childLabel.json_encode($childUrl));
                }
                
            }
            $theChild = reIndex($theChild);
            if($theChild or $this->checkNavPermission($data["action"])) {
                $theNav[$rootLabel] = array(
                    "childs" => $theChild,
                    "label"  => $rootLabel,
                    "icon"   => $data["icon"],
                    "id"     => md5($rootLabel.json_encode($data)),
                    "url"    => $data["action"] ? $data["action"] : ""
                );
            }
        }


        $theNav = reIndex($theNav);

        return $theNav;
    }
    
    private function checkNavPermission($url) {
        list($group, $action, $module) = explode("/", $url);
//        var_dump(preg_match("/[A-Z]+.*/", $group));
        //非rest模式， $action和$module对换
        $notRest = preg_match("/^[A-Z]/", $action);
        if($notRest) {
            $tmp = $module;
            $module = $action;
            $action = $tmp ? $tmp : "Index";
        } else {
            $action = $this->parseActionName($action);
            $module = ucfirst($module);
        }
        
        $rule = sprintf("%s.%s.%s", $group, $module, $action);

        $result = $this->checkPermission($rule, true);
        
        return $result;
    }
    
}