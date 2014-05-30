<?php

class IndexAction extends CommonAction {
    
    public function index(){
        unset($_SESSION["user"]["password"]);
        $data = array(
            "navs" => $this->makeNav(),
            "user" => $_SESSION["user"]
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
        
        $navs = require APP_PATH.DS."Conf".DS."navs.php";
        
        import("@.ORG.Auth");
        $auth = new Auth();
        
        foreach($navs as $rootLabel => $data) {
            $theChild = array();
            foreach($data["childs"] as $childLabel => $childData) {
                $theThird = array();
                // 包含三级菜单
                if(is_array($childData)) {
                    foreach($childData as $thirdLabel => $thirdData) {
                        if($this->checkNavPermission($thirdData)) {
                            $theThird[] = array(
                                "label" => $thirdLabel,
                                "url"   => $thirdData,
                                "id"    => md5($thirdData.$thirdLabel)
                            );
                        }
                    }
                }
                
                if($theThird) {
                    $theChild[$childLabel]["childs"] = $theThird;
                } else {
                    $tmpRs = $this->checkNavPermission($childData);
//                    echo $childData;
//                    var_dump($tmpRs);
                    if($tmpRs) {
                        $theChild[$childLabel]["url"] = $childData;
                    }
                }
                if($theThird or $tmpRs) {
                    $theChild[$childLabel]["label"] = $childLabel;
                    $theChild[$childLabel]["id"] = md5($childLabel.json_encode($childData));
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
            
            $theNav = reIndex($theNav);
        }
//        F("Nav/".$this->user["id"], $theNav);
//        print_r($theNav);exit;
        return $theNav;
    }
    
    private function checkNavPermission($url) {
        list($group, $action, $module) = explode("/", $url);
        $module = ucfirst($module);
        $action = $this->parseActionName($action);
        return $this->checkPermission(sprintf("%s.%s.%s", $group, $module, $action), true);
    }
    
}