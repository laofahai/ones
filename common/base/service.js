'use strict';
/**
 * 定义资源
 * */
(function(angular){
    angular.module('ones.common.resources', [])
        .factory("ConfigRes", ["$resource", "ones.config", function($resource, conf) {
            return $resource(conf.BSU + "home/config/:id.json", null, {'update': {method: 'PUT'}});
        }])
        .factory("TypesRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "home/types/:id.json", null, {'update': {method: 'PUT'}});
        }])
        .factory("StockTransferRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "jxc/stockTransfer/:id.json", null, {'doWorkflow': {method: 'GET'}, 'update': {method: 'PUT'}});
        }])
        .factory("OutsideRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "jxc/outside/:id.json", null, {'doWorkflow': {method: 'GET'}, 'update': {method: 'PUT'}});
        }])
        .factory("AppsRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "home/apps/:id.json", null, {update: {method: 'PUT'}});
        }])
    ;
})(angular);