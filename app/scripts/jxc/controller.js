'use strict'

angular.module("erp.jxc", ['erp.jxc.services', 'ngGrid'])
        .config(function($routeProvider) {
            $routeProvider
                    .when('/JXC/Stockin', {
                        templateUrl: 'views/jxc/stockin/index.html',
                        controller: 'JXCStockinCtl'
                    })
                    .when('/JXC/Goods', {
                        templateUrl: 'CommonView/grid.html',
                        controller: 'JXCGoodsCtl'
                    });
        })

        .controller("JXCStockinCtl", function($scope) {
            $scope.message = "hi, i am stockin";
        })

        .controller("JXCGoodsCtl", ["$scope", "GoodsRes", function($scope, GoodsRes) {
                
                var columnDefs = [
                    {field: 'id', displayName: 'ID', resizable: false, width: '100'},
                    {field: 'factory_code', displayName: "系统编码", width: "100"},
                    {field: 'name', displayName: '产品名称', width: "200"},
                    {field: 'measure', displayName: '计量单位', width: '80'},
                    {field: 'category_name', displayName: '所属分类', width: '80'},
                    {field: 'price', displayName: "基本价格", width: '100'},
                    {
                        displayName: "操作",
                        sortAble: false
                    }];
                
                
                CommonView.displyGrid($scope, GoodsRes, columnDefs);
            }]);
