<?php
/**
    rest 路由
 *  */

/**
 * 自动生成URL路由
 * array("home/dataModel/:id\d", "HOME/DataModel/read", "", "get", "json"),
    array("home/dataModel/:id\d", "HOME/DataModel/update", "", "put", "json"),
    array("home/dataModel", "HOME/DataModel/index", "", "get", "json"),
    array("home/dataModel", "HOME/DataModel/insert", "", "post", "json"),
    array("home/dataModel/:id", "HOME/DataModel/delete", "", "delete", "json"),
 */
function routeMaker($resName, $mapUrl, $methods = array()) {
    if(!$methods) {
        $methods = array("list", "get", "put", "post", "delete");
    }
    
    $return = array();
    
    if(in_array("get", $methods)) {
        array_push($return, array(
            $resName."/:id\d", $mapUrl."/read", "", "get", "json"
        ));
    }
    if(in_array("list", $methods)) {
        array_push($return, array(
            $resName, $mapUrl."/index", "", "get", "json"
        ));
    }
    if(in_array("put", $methods)) {
        array_push($return, array(
            $resName."/:id\d", $mapUrl."/update", "", "put", "json"
        ));
    }
    if(in_array("post", $methods)) {
        array_push($return, array(
            $resName, $mapUrl."/insert", "", "post", "json"
        ));
    }
    if(in_array("delete", $methods)) {
        array_push($return, array(
            $resName."/:id", $mapUrl."/delete", "", "delete", "json"
        ));
    }
    
    return $return;
    
}

$base = array(
    //array("passport/userLogin", "HOME/Passport/userLogin", "", "get", "json"),
    
);

$urlRoutes = array_merge($base, 
    routeMaker("passport/userLogin", "Passport/Login", array("post")),
        
    routeMaker("home/dataModel", "HOME/DataModel"),
    routeMaker("home/dataModelFields", "HOME/DataModelFields"),
    routeMaker("home/dataModelData", "HOME/DataModelData"),
        
    routeMaker("workflow/nodes", "HOME/WorkflowNode"),
    
    routeMaker("jxc/stock", "JXC/Stock"),
    routeMaker("jxc/goods", "JXC/Goods"),
    routeMaker("jxc/goodsCategory", "JXC/GoodsCategory"),
    routeMaker("jxc/stockProductList", "JXC/StockProductList", array("list", "get")),
    routeMaker("jxc/stockin", "JXC/Stockin", null)
);

return $urlRoutes;