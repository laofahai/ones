'use strict';
(function(){
    angular.module("ones.statistics", ["ones.statistics.service", "ngHighcharts"])
        .config(["$routeProvider", function($routeProvider){
            $routeProvider.when('/Statistics/list/sale', {
                templateUrl: 'views/statistics/sale.html',
                controller: 'StatisticsSaleCtl'
            })
//            ;
        }])
        .controller("StatisticsSaleCtl", ["$scope", "$timeout", "ComView", "StatisticsSaleRes", "$rootScope",
            function($scope, $timeout, ComView, res, $rootScope){
                var timestamp = Date.parse(new Date());
                var startTime = timestamp-3600*24*30*1000;
                $scope.formData = $scope.formData || {};
                $scope.formData._filter_start_dateline = startTime;
                $scope.formData._filter_end_dateline = timestamp;
                var filters = {
                    between: {
                        field: "dateline",
                            defaultData: [startTime, timestamp],
                            inputType: "datepicker"
                    }
                };
                $scope.$parent.currentPage.actionDesc = sprintf("%s ~ %s",
                    toDate($scope.formData._filter_start_dateline/1000, true), toDate($scope.formData._filter_end_dateline/1000, true)
                );

                $scope.selectAble = false;

                ComView.makeFilters($scope, filters);


                $scope.barData = [];
                $scope.categories = [];
                var doQuery = function () {
                    res.query($scope.formData).$promise.then(function(data){
                        $scope.barData = data;
                        $scope.modal.hide();
                    });
                };

                $scope.doFilter = function() {
                    doQuery();
                };

                $scope.options = {
                    xAxis: {
                        title: {
                            text: "123"
                        },
                        categories: [],
                        labels: {
                            rotation: -45,
                            align: 'right',
                            style: {
                                fontSize: '12px',
                                fontFamily: 'Verdana, sans-serif'
                            }
                        }
                    },
                    series: []
                };

                doQuery();
            }])
    ;
})();