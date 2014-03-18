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
            $this->assign("LeftNavs", $navs);
            return;
        }
        
        $navs = require APP_PATH.DS."Conf".DS."navs.php";
        $auth=new Auth();
        foreach($navs as $label => $n) {
            $childs = array();
            foreach($n["childs"] as $cl => $c) {
                list($group, $module, $action) = explode("/", $c);
                $action = $action ? $action : "index";
                $authName = sprintf("%s.%s.%s", $group, $module, $action);
                if(!$auth->check($authName, $_SESSION["user"]["id"])) {
                    continue;
                }
//                if(substr($c, 0, 1) == "#" or substr($c, 0, 11) == "javascript:") {
//                    $url = $c;
//                } else {
//                    $url = U("/".$c);
//                }
                $url = $c;
                $childs[] = array(
                    "label" => $cl,
                    "url"   => $url,
                    "id"    => md5($url.$cl)
                );
            }
            
            $url = $n["action"];
            if($childs or isset($n["action"])) {
                $theNav[] = array(
                    "childs" => $childs,
                    "label"  => $label,
                    "icon"   => $n["icon"],
                    "url"    => $url,
                    "id"     => md5($label.$url.$childs)
                );
            }
            
        }
        F("Nav/".$this->user["id"], $theNav);
        return $theNav;
    }
    
}