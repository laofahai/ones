'use strict';

/**
 * 定义资源
 * */

ERP.factory("UserRes", ["$resource", "erp.config", function($resource, cnf) {
        return $resource(cnf.BSU + "passport/profile.json");
    }]);

ERP.factory("StockinRes", ["$resource", "erp.config", function($resource, cnf) {
        return $resource(cnf.BSU + "jxc/stockin/:id.json");
    }]);

ERP.factory("GoodsRes", ["$resource", "erp.config", function($resource, cnf) {
        return $resource(cnf.BSU + "jxc/goods/:id.json");
    }]);

ERP.factory("GoodsCategoryRes", ["$resource", "erp.config", function($resource, cnf) {
        return $resource(cnf.BSU + "jxc/goodsCategory/:id.json");
    }]);