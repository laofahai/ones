(function(window, angular, ones, io){
    'use strict';
    angular.module('ones.app.storage.main', [
        'ones.app.storage.model',
        'ones.billModule',
        'ones.app.storage.stockIn',
        'ones.app.storage.stockOut'
    ])
        .config(['$routeProvider', function($route) {
            $route
                // 新增单据
                .when('/storage/stockIn/add/bill', {
                    controller : 'StockInBillEditCtrl',
                    templateUrl: appView('stock_in_edit.html')
                })
                // 新增单据，确认入库，查看详情
                .when('/storage/stockIn/:action/bill/:id', {
                    controller : 'StockInBillEditCtrl',
                    templateUrl: appView('stock_in_edit.html')
                })
                .when('/storage/stockIn/:action/bill/:id/node/:node_id', {
                    controller : 'StockInBillEditCtrl',
                    templateUrl: appView('stock_in_edit.html')
                })

                .when('/storage/stockOut/add/bill', {
                    controller : 'StockOutBillEditCtrl',
                    templateUrl: appView('stock_out_edit.html')
                })
                .when('/storage/stockOut/:action/bill/:id', {
                    controller : 'StockOutBillEditCtrl',
                    templateUrl: appView('stock_out_edit.html')
                })
                .when('/storage/stockOut/:action/bill/:id/node/:node_id', {
                    controller : 'StockOutBillEditCtrl',
                    templateUrl: appView('stock_out_edit.html')
                })
        }])
    ;

})(window, window.angular, window.ones, window.io);