'use strict';

/**
 * 定义资源
 * */

ERP.factory("UserRes", ["$resource", "erp.config", function($resource, cnf) {
        return $resource(cnf.BSU + "passport/profile.json", null, {'update': { method:'PUT' }});
    }]);

ERP.factory("StockinRes", ["$resource", "erp.config", function($resource, cnf) {
        return $resource(cnf.BSU + "jxc/stockin/:id.json", null, {'update': { method:'PUT' }});
    }]);
ERP.factory("DataModelRes", ["$resource", "erp.config", function($resource, cnf) {
        return $resource(cnf.BSU + "home/dataModel/:id.json", null, {'update': { method:'PUT' }});
    }]);
ERP.factory("DataModelFieldsRes", ["$resource", "erp.config", function($resource, cnf) {
        return $resource(cnf.BSU + "home/dataModelFields/:id.json", null, {'update': { method:'PUT' }});
    }]);
ERP.factory("GoodsRes", ["$resource", "erp.config", function($resource, cnf) {
        return $resource(cnf.BSU + "jxc/goods/:id.json", null, {'update': { method:'PUT' }});
    }]);

ERP.factory("GoodsCategoryRes", ["$resource", "erp.config", function($resource, cnf) {
        return $resource(cnf.BSU + "jxc/goodsCategory/:id.json", null, {'update': { method:'PUT' }});
    }]);