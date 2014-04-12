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
    array("JXC/StockProductList/Export", "HOME/JXC/StockProductList/Export", "", "get", "json"),
);

$urlRoutes = array_merge($base, 
    routeMaker("passport/userLogin", "Passport/Login", array("post")),
    
    routeMaker("user", "Passport/User"),
    routeMaker("passport/authRule", "Passport/AuthRule"),
    routeMaker("passport/authGroup", "Passport/AuthGroup"),
    routeMaker("passport/authGroupRule", "Passport/AuthGroupRule"),
    routeMaker("passport/department", "Passport/Department"),
        
    routeMaker("types", "HOME/Types"),
    routeMaker("config", "HOME/Config"),
    routeMaker("home/dataModel", "HOME/DataModel"),
    routeMaker("home/dataModelFields", "HOME/DataModelFields"),
    routeMaker("home/dataModelData", "HOME/DataModelData"),
    
    routeMaker("workflow/nodes", "HOME/WorkflowNode"),
    routeMaker("workflow/process", "HOME/WorkflowProcess", array("get")),
    routeMaker("workflow", "HOME/Workflow"),
        
    routeMaker("crm/relCompanyGroup", "CRM/RelationshipCompanyGroup"),
    routeMaker("crm/relCompany", "CRM/RelationshipCompany"),
    
    routeMaker("jxc/stock", "JXC/Stock"),
    routeMaker("jxc/goods", "JXC/Goods"),
    routeMaker("jxc/orders", "JXC/Orders"),
    routeMaker("jxc/goodsTpl", "JXC/ProductTpl"),
    routeMaker("jxc/outside", "JXC/Outside"),
    routeMaker("jxc/goodsCategory", "JXC/GoodsCategory"),
    routeMaker("jxc/StockWarning", "JXC/StockWarning", array("list")),
    routeMaker("jxc/stockProductList", "JXC/StockProductList", array("list", "get", "put")),
    routeMaker("jxc/stockin", "JXC/Stockin", null),
    routeMaker("jxc/stockout", "JXC/Stockout", null)
);

//print_r($urlRoutes);

return $urlRoutes;