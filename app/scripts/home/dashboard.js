'use strict';
(function(angular){
    angular.module("ones.home.dashboard", [])
        .controller("HOMEDashboardCtl", ["$scope", "UserDesktopRes", function($scope, UserDesktopRes){
                
            $scope.items = [];
            UserDesktopRes.query({}, function(data){
                angular.forEach(data, function(block){
                    if(block.template.indexOf("/") < 0) {
                        block.template = "views/home/dashboardItems/"+block.template;
                    }
                });
                $scope.items = data;
            });
        }])
    
        .controller("DashboardStockinCtl", ["$scope", "StockinRes", function($scope, res){
                res.query({
                    latest: true,
                    limit: 5
                }).$promise.then(function(data){
                    $scope.items = data;
                });
        }])
    
        .controller("DashboardStockoutCtl", ["$scope", "StockoutRes", function($scope, res){
                res.query({
                    latest: true,
                    limit: 5,
                    handled: true
                }).$promise.then(function(data){
                    $scope.items = data;
                });
        }])
    
        .controller("DashboardNeedStockoutCtl", ["$scope", "StockoutRes", function($scope, res){
                res.query({
                    latest: true,
                    unhandled: true,
                    limit: 5
                }).$promise.then(function(data){
                    $scope.items = data;
                });
        }])
    ;
})(angular);