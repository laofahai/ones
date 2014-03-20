<?php
/**
    rest 路由
 *  */

return array(
    array("passport/profile", "HOME/Passport/index", "", "get", "json"),
    array("passport/isLogin", "HOME/Passport/doLogin", "", "get", "json"),
    array("passport/userLogin", "HOME/Passport/userLogin", "", "get", "json"),
    
    /**
     * 进销存
     */
    array("jxc/goods/:id\d", "JXC/Goods/read", "", "get", "json"),
    array("jxc/goods/:id\d", "JXC/Goods/update", "", "put", "json"),
    array("jxc/goods/:id\d", "JXC/Goods/delete", "", "delete", "json"),
    array("jxc/goods", "JXC/Goods/index", "", "get", "json"),
    array("jxc/goods", "JXC/Goods/insert", "", "post", "json"),
    
    array("jxc/goodsCategory/:id", "JXC/GoodsCategory/index", "", "get", "json"),
);