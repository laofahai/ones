<?php
/**
    rest 路由
 *  */

return array(
    array("test", "HOME/Index/index", "", "get", "json"),
    array("test/:id\d", "HOME/Index/index", "", "get", "json"),
    
    array("passport/isLogin", "HOME/Passport/doLogin", "", "get", "json"),
    array("passport/userLogin", "HOME/Passport/userLogin", "", "get", "json"),
    
    /***/
    array("jxc/goods/:id", "JXC/Goods/index", "", "get", "json"),
);