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
    
    private function checkNavPermission($url) {
        $auth=new Auth();
        list($group, $module, $action) = explode("/", $url);
        $action = $action ? $action : "index";
        $authName = sprintf("%s.%s.%s", $group, $module, $action);
        if($auth->check($authName, $_SESSION["user"]["id"])) {
            return true;
        }
        return false;
    }
    
    /**
     * 根据AuthRule生成左侧导航，不同用户生成不同缓存
     * @todo 三级分类（快捷导航）
     */
    private function makeNav() {
        $navs = F("Nav/".$this->user["id"]);
        if($navs and false) {
            return $navs;
        }
        
        $navs = require APP_PATH.DS."Conf".DS."navs.php";
        
        $auth=new Auth();
        
        foreach($navs as $rootLabel => $data) {
            $theChild = array();
            foreach($data["childs"] as $childLabel => $childData) {
                $theThird = array();
                // 包含三级菜单
                if(is_array($childData)) {
                    foreach($childData as $thirdLabel => $thirdData) {
                        if($this->checkNavPermission($thirdData) or true) {
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
                    $theChild[$childLabel]["url"] = $childData;
                }
                $theChild[$childLabel]["label"] = $childLabel;
                $theChild[$childLabel]["id"] = md5($childLabel.json_encode($childData));
            }
            $theChild = reIndex($theChild);
            $theNav[$rootLabel] = array(
                "childs" => $theChild,
                "label"  => $rootLabel,
                "icon"   => $data["icon"],
                "id"     => md5($rootLabel.json_encode($data)),
                "url"    => $data["action"] ? $data["action"] : ""
            );
            $theNav = reIndex($theNav);
        }
//        F("Nav/".$this->user["id"], $theNav);
//        print_r($theNav);exit;
        return $theNav;
    }
    
}