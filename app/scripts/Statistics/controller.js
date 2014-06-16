'use strict';
(function(){
    angular.module("ones.statistics", ["ones.statistics.service"])
        .config(["$routeProvider", function($routeProvider){
//            $routeProvider.when('/Statistics/list/productView', {
//                templateUrl: 'views/statistics/productView.html',
//                controller: 'StatisticsProductViewCtl'
//            })
//            ;
        }])
        .controller("StatisticsProductViewCtl", ["$scope", function($scope){

        }])
    ;
})();