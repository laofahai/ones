'use strict';

/**
 * 定义资源
 * */
ERP.factory("UserProfileRes", ["$resource", "ones.config", function($resource, cnf) {
        return $resource(cnf.BSU + "passport/profile.json", null, {'update': {method: 'PUT'}});
    }])
    .factory("UserRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "user/:id.json", null, {'update': {method: 'PUT'}});
        }])
    .factory("DepartmentRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "passport/department/:id.json", null, {'update': {method: 'PUT'}});
        }])
    .factory("AuthRuleRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "passport/authRule/:id.json", null, {'update': {method: 'PUT'}});
        }])
    .factory("AuthGroupRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "passport/authGroup/:id.json", null, {'update': {method: 'PUT'}});
        }])
    .factory("AuthGroupRuleRes", ["$resource", "ones.config", function($resource, cnf){
        return $resource(cnf.BSU + "passport/authGroupRule/:id.json", null, {
            'update': {method: 'PUT'},
            'query' : {isArray: false}
        });
    }])
    .factory("WorkflowRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "workflow/:id.json", null, {'update': {method: 'PUT'}});
        }])
    .factory("WorkflowNodeRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "workflow/nodes/:id.json", null, {'update': {method: 'PUT'}});
        }])
    .factory("WorkflowProcessRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "workflow/process/:id.json", {type: "@type"});
        }])
    .factory("TypesRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "types/:id.json", null, {'update': {method: 'PUT'}});
        }])
    .factory("ConfigRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "config/:id.json", null, {'update': {method: 'PUT'}});
        }])
    .factory("DataModelRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "home/dataModel/:id.json", null, {'update': {method: 'PUT'}});
        }])
    .factory("DataModelFieldsRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "home/dataModelFields/:id.json", null, {'update': {method: 'PUT'}});
        }])
    .factory("DataModelDataRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "home/dataModelData/:id.json", null, {'update': {method: 'PUT'}});
        }])
    .factory("GoodsRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "jxc/goods/:id.json", null, {'update': {method: 'PUT'}});
        }])
    .factory("ProductTplRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "jxc/productTpl/:id.json", null, {'update': {method: 'PUT'}});
        }])
    .factory("ProductTplDetailRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "jxc/productTplDetail/:id.json", null, {'update': {method: 'PUT'}});
        }])
    .factory("StockRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "jxc/stock/:id.json", null, {'update': {method: 'PUT'}});
        }])
    .factory("StockWarningRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "jxc/stockWarning.json");
        }])
    .factory("StockinRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "jxc/stockin/:id.json", null, 
            {
                'doWorkflow': {method: 'GET'}, 
                'doPostWorkflow': {method: 'POST'}, 
                'update': {method: 'PUT'}
            });
        }])
    .factory("StockTransferRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "jxc/stockTransfer/:id.json", null, {'doWorkflow': {method: 'GET'}, 'update': {method: 'PUT'}});
        }])
    .factory("OutsideRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "jxc/outside/:id.json", null, {'doWorkflow': {method: 'GET'}, 'update': {method: 'PUT'}});
        }])
    .factory("StockProductListRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "jxc/stockProductList/:id.json", null, {'update': {method: 'PUT'}});
        }])
    .factory("GoodsCategoryRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "jxc/goodsCategory/:id.json", null, {'update': {method: 'PUT'}});
        }])
    .factory("StockoutRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "jxc/stockout/:id.json", null, 
            {
                'doWorkflow': {method: 'GET'}, 
                'doPostWorkflow': {method: 'POST'}, 
                'update': {method: 'PUT'}
            });
        }])
    .factory("OrdersRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "jxc/orders/:id.json", null, {'doWorkflow': {method: 'GET'}, 'update': {method: 'PUT'}});
        }])
    .factory("PurchaseRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "jxc/purchase/:id.json", null, {'doWorkflow': {method: 'GET'}, 'update': {method: 'PUT'}});
        }])
    .factory("RelCompanyGroupRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "crm/relCompanyGroup/:id.json", null, {'update': {method: 'PUT'}});
        }])
    .factory("RelCompanyRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "crm/relCompany/:id.json", null, {'update': {method: 'PUT'}});
        }])
    .factory("ReturnsRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "jxc/returns/:id.json", null, 
            {
                'doWorkflow': {method: 'GET'}, 
                'doPostWorkflow': {method: 'POST'}, 
                'update': {method: 'PUT'}
            });
        }])
    .factory("CraftRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "jxc/craft/:id.json", null, {'update': {method: 'PUT'}});
        }])
    //财务模块
    .factory("FinanceAccountRes", ["$resource", "ones.config", function($resource, cnf){
            return $resource(cnf.BSU+"finance/financeAccount/:id.json", null, {'update': {method: 'PUT'}});
    }])
    .factory("FinanceRecordRes", ["$resource", "ones.config", function($resource, cnf){
            return $resource(cnf.BSU+"finance/financeRecord/:id.json", null, {});
    }])
    .factory("FinanceReceivePlanRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "finance/financeReceivePlan/:id.json", null, 
            {
                'doWorkflow': {method: 'GET'}, 
                'doPostWorkflow': {method: 'POST'}, 
                'update': {method: 'PUT'}
            });
        }])
    .factory("FinancePayPlanRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "finance/financePayPlan/:id.json", null, 
            {
                'doWorkflow': {method: 'GET'}, 
                'doPostWorkflow': {method: 'POST'}, 
                'update': {method: 'PUT'}
            });
        }])
    //生产模块
    .factory("ProducePlanRes", ["$resource","ones.config", function($resource, cnf){
            return $resource(cnf.BSU+"produce/producePlan/:id.json", null, {'update': {method: 'PUT'}});
    }])
    ;