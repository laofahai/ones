'use strict';
(function(){
    angular.module("ones.statistics", ["ones.statistics.service"])
        .config(["$routeProvider", function($routeProvider){
            $routeProvider.when('/Statistics/list/sale', {
                templateUrl: 'views/statistics/sale.html',
                controller: 'StatisticsSaleCtl'
            })
//            ;
        }])
        .controller("StatisticsProductViewCtl", ["$scope", function($scope){

        }])
        .controller("StatisticsSaleCtl", ["$scope", "$timeout", "$rootScope", function($scope, $timeout, $rootScope){
            $timeout(function() {
                $scope.data = {
                    series: [''],
                    data : [{
                        x : "1月份",
                        y: [100],
                        tooltip:"this is tooltip"
                    },
                    {
                        x : "Not Sales",
                        y: [300]
                    },
                    {
                        x : "三月份",
                        y: [55]
                    },
                    {
                        x : "Not Tax",
                        y: [54]
                    }]
                };
            }, 100);

            $scope.chartType = 'bar';

            $scope.config = {
                labels: true,
                title : null,
                legend : {
                    display:true,
                    position:'left'
                },
                innerRadius: 0
            };
        }])
    ;
})();