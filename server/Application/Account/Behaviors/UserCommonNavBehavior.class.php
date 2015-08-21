<?php
namespace Account\Behaviors;
use Think\Behavior;

class UserCommonNavBehavior extends Behavior {
    
    /*
     * 用户首选项中常用菜单，增加至导航首位
     * **/
    public function run(&$params) {
        
        $source = $params;

        $service = D('Account/UserPreference', 'Service');
        $common_nav = $service->get_preference("common_nav");
        $common_nav = $common_nav['data'];
        if(!$common_nav) {
            return ;
        }

//        array_unshift($common_nav, array(
//            "alias" => "Dashboard",
//            "app" => "dashboard",
//            "icon" => "dashboard",
//            "link" => "dashboard"
//        ));
        
        $navs = array(
            array(
                "alias" => "Common Operation",
                "icon" => "bookmark",
                "children" => $common_nav
            )
        );

        $params = array_merge($navs, $source);
    }
    
}