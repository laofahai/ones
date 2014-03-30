'use strict';

/**
 * 定义资源
 * */

ERP.factory("UserRes", ["$resource", "erp.config", function($resource, cnf) {
        return $resource(cnf.BSU + "passport/profile.json", null, {'update': { method:'PUT' }});
    }]);
ERP.factory("WorkflowNodeRes", ["$resource", "erp.config", function($resource, cnf) {
        return $resource(cnf.BSU + "workflow/nodes.json", null, {'update': { method:'PUT' }});
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
ERP.factory("DataModelDataRes", ["$resource", "erp.config", function($resource, cnf) {
        return $resource(cnf.BSU + "home/dataModelData/:id.json", null, {'update': { method:'PUT' }});
    }]);
ERP.factory("GoodsRes", ["$resource", "erp.config", function($resource, cnf) {
        return $resource(cnf.BSU + "jxc/goods/:id.json", null, {'update': { method:'PUT' }});
    }]);
ERP.factory("StockRes", ["$resource", "erp.config", function($resource, cnf) {
    return $resource(cnf.BSU + "jxc/stock/:id.json");
}]);
ERP.factory("StockinRes", ["$resource", "erp.config", function($resource, cnf) {
        return $resource(cnf.BSU + "jxc/stockin/:id.json", null, {'doWorkflow': {method:'GET'}});
    }]);
ERP.factory("StockProductsRes", ["$resource", "erp.config", function($resource, cnf) {
        return $resource(cnf.BSU + "jxc/stockProductList/:id.json");
    }]);
ERP.factory("GoodsCategoryRes", ["$resource", "erp.config", function($resource, cnf) {
        return $resource(cnf.BSU + "jxc/goodsCategory/:id.json", null, {'update': { method:'PUT' }});
    }]);