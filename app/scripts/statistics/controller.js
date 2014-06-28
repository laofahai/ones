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

                //变量预设
                var timestamp = Date.parse(new Date());
                var startTime = timestamp-3600*24*30*1000;
                $scope.formData = $scope.formData || {};
                $scope.formData._filter_start_dateline = startTime;
                $scope.formData._filter_end_dateline = timestamp;
                $scope.formData.timeStep = "day";
                var filters = {
                    between: {
                        field: "dateline",
                        defaultData: [startTime, timestamp],
                        inputType: "datepicker"
                    },
                    select: {
                        field: "timeStep",
                        inputType: "select",
                        displayName: $rootScope.i18n.lang.showType,
                        dataSource: [
                            {id: "day", name: $rootScope.i18n.lang.show_by_day},
                            {id: "month", name: $rootScope.i18n.lang.show_by_month},
                            {id: "year", name: $rootScope.i18n.lang.show_by_year}
                        ]
                    }
                };

                //page desc
                $scope.$parent.currentPage.actionDesc = sprintf("%s ~ %s",
                    toDate($scope.formData._filter_start_dateline/1000, true), toDate($scope.formData._filter_end_dateline/1000, true)
                );

                $scope.selectAble = false;

                //过滤器
                ComView.makeFilters($scope, filters);
                $scope.doFilter = function() {
                    doQuery();
                    $scope.modal.hide();
                };

                $scope.barData = [];
                $scope.categories = [];
                $scope.options = {
                    xAxis: {
                        title: {},
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

                var doQuery = function () {
                    res.query($scope.formData).$promise.then(function(data){
                        $scope.barData = data;
                    });
                };

                doQuery();
            }])
    ;
})();