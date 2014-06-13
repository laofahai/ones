'use strict';
(function(angular){
    angular.module("ones.home.dashboard", [])
        .controller("HOMEDashboardCtl", ["$scope", "MyDesktopRes", function($scope, MyDesktopRes){
                
            $scope.items = [];
            MyDesktopRes.query({
                onlyUsed: true
            }, function(data){
                angular.forEach(data, function(block){
                    if(block.template.indexOf("/") < 0) {
                        block.template = "views/home/dashboardItems/"+block.template;
                    }
                });
                $scope.items = data;
            });
        }])
    
        .controller("DashboardProduceInProcess", ["$scope", "ProducePlanDetailRes", function($scope, res){
                var func = function(){
                    res.query({
                        limit: 5
                    }).$promise.then(function(data){
                        $scope.items = data;
                    });
                };
                setInterval(function(){
                    func();
                }, 60000);
                func();
        }])
    
        .controller("DashboardStockinCtl", ["$scope", "StockinRes", function($scope, res){
                var func = function(){
                    res.query({
                        latest: true,
                        limit: 5
                    }).$promise.then(function(data){
                        $scope.items = data;
                    });
                };
                setInterval(function(){
                    func();
                }, 60000);
                func();
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