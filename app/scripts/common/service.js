'use strict';

/**
 * 定义资源
 * */
ERP.factory("UserProfileRes", ["$resource", "erp.config", function($resource, cnf) {
        return $resource(cnf.BSU + "passport/profile.json", null, {'update': {method: 'PUT'}});
    }])
    .factory("UserRes", ["$resource", "erp.config", function($resource, cnf) {
            return $resource(cnf.BSU + "user/:id.json", null, {'update': {method: 'PUT'}});
        }])
    .factory("DepartmentRes", ["$resource", "erp.config", function($resource, cnf) {
            return $resource(cnf.BSU + "passport/department/:id.json", null, {'update': {method: 'PUT'}});
        }])
    .factory("AuthRuleRes", ["$resource", "erp.config", function($resource, cnf) {
            return $resource(cnf.BSU + "passport/authRule/:id.json", null, {'update': {method: 'PUT'}});
        }])
    .factory("AuthGroupRes", ["$resource", "erp.config", function($resource, cnf) {
            return $resource(cnf.BSU + "passport/authGroup/:id.json", null, {'update': {method: 'PUT'}});
        }])
    .factory("AuthGroupRuleRes", ["$resource", "erp.config", function($resource, cnf){
        return $resource(cnf.BSU + "passport/authGroupRule/:id.json", null, {
            'update': {method: 'PUT'},
            'query' : {isArray: false}
        });
    }])
    .factory("WorkflowRes", ["$resource", "erp.config", function($resource, cnf) {
            return $resource(cnf.BSU + "workflow/:id.json", null, {'update': {method: 'PUT'}});
        }])
    .factory("WorkflowNodeRes", ["$resource", "erp.config", function($resource, cnf) {
            return $resource(cnf.BSU + "workflow/nodes/:id.json", null, {'update': {method: 'PUT'}});
        }])
    .factory("WorkflowProcessRes", ["$resource", "erp.config", function($resource, cnf) {
            return $resource(cnf.BSU + "workflow/process/:id.json", {type: "@type"});
        }])
    .factory("TypesRes", ["$resource", "erp.config", function($resource, cnf) {
            return $resource(cnf.BSU + "types/:id.json", null, {'update': {method: 'PUT'}});
        }])
    .factory("DataModelRes", ["$resource", "erp.config", function($resource, cnf) {
            return $resource(cnf.BSU + "home/dataModel/:id.json", null, {'update': {method: 'PUT'}});
        }])
    .factory("DataModelFieldsRes", ["$resource", "erp.config", function($resource, cnf) {
            return $resource(cnf.BSU + "home/dataModelFields/:id.json", null, {'update': {method: 'PUT'}});
        }])
    .factory("DataModelDataRes", ["$resource", "erp.config", function($resource, cnf) {
            return $resource(cnf.BSU + "home/dataModelData/:id.json", null, {'update': {method: 'PUT'}});
        }])
    .factory("GoodsRes", ["$resource", "erp.config", function($resource, cnf) {
            return $resource(cnf.BSU + "jxc/goods/:id.json", null, {'update': {method: 'PUT'}});
        }])
    .factory("StockRes", ["$resource", "erp.config", function($resource, cnf) {
            return $resource(cnf.BSU + "jxc/stock/:id.json", null, {'update': {method: 'PUT'}});
        }])
    .factory("StockinRes", ["$resource", "erp.config", function($resource, cnf) {
            return $resource(cnf.BSU + "jxc/stockin/:id.json", null, {'doWorkflow': {method: 'GET'}});
        }])
    .factory("StockProductsRes", ["$resource", "erp.config", function($resource, cnf) {
            return $resource(cnf.BSU + "jxc/stockProductList/:id.json");
        }])
    .factory("GoodsCategoryRes", ["$resource", "erp.config", function($resource, cnf) {
            return $resource(cnf.BSU + "jxc/goodsCategory/:id.json", null, {'update': {method: 'PUT'}});
        }])
    .factory("RelCompanyGroupRes", ["$resource", "erp.config", function($resource, cnf) {
            return $resource(cnf.BSU + "crm/relCompanyGroup/:id.json", null, {'update': {method: 'PUT'}});
        }])
    .factory("RelCompanyRes", ["$resource", "erp.config", function($resource, cnf) {
            return $resource(cnf.BSU + "crm/relCompany/:id.json", null, {'update': {method: 'PUT'}});
        }])