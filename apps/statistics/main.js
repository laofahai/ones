(function(){
    angular.module("ones.statistics", ["ngHighcharts"])
        .config(["$routeProvider", function($routeProvider){
            $routeProvider.when('/statistics/list/sale', {
                    templateUrl: appView('sale.html', "statistics"),
                    controller: 'StatisticsSaleCtl'
                })
                .when('/:app/statistics/:module', {
                    templateUrl: appView('entry.html', "statistics"),
                    controller: "CommonStatisticsCtl"
                })
            ;
        }])

        /**
         * items: {
         *  subject:
         *  type:
         *  res:
         *  options: {
         *      queryParams:
         *  }
         * }
         * */
        .service("CommonStatisticsService", [function(){

            var statisticsItems = [];

            this.setStatisticsItem = function() {}
        }])

        .controller("CommonStatisticsCtl", ["$scope", "CommonStatisticsService", "$injector",
            function($scope, statisticsService, $injector){

            }])



        //统计
        .factory("ProductViewRes", ["$resource","ones.config", function($resource, cnf){
            return $resource(cnf.BSU+"statistics/productView/:id.json");
        }])
        .factory("StatisticsSaleRes", ["$resource","ones.config", function($resource, cnf){
            return $resource(cnf.BSU+"statistics/sale/:id.json");
        }])


        .service("ProductViewModel", ["$rootScope", "pluginExecutor", function($rootScope, plugin){
            var startTime = new Date();
            var endTime = new Date();
            startTime.setMonth(startTime.getMonth()-1);
            return {
                config: {
                    filters: {
                        between: {
                            field: "dateline",
                            defaultData: [getDateForInput(startTime), getDateForInput(endTime)],
                            inputType: "datetime"
                        }
                    }
                },
                structure: {
                    factory_code_all: {},
                    goods_name: {},
                    measure: {},
                    store_num: {
                        displayName: l('lang.storeNum')
                    }
                },
                getStructure: function() {

                    if(isAppLoaded("sale")) {
                        this.structure.sale_num = {};
                        this.structure.sale_amount = {cellFilter: "toCurrency:'￥'"};
                    }

                    if(isAppLoaded("purchase")) {
                        this.structure.purchase_num = {};
                        this.structure.purchase_amount = {cellFilter: "toCurrency:'￥'"};
                    }

                    if(isAppLoaded("produce")) {
                        this.structure.produce = {field: "produce_num"};
                    }

                    plugin.callPlugin("bind_dataModel_to_structure", {
                        structure: this.structure,
                        alias: "product",
                        after: "goods_name"
                    });
                    return ones.pluginScope.get("defer").promise;
                }
            };
        }])

        .controller("StatisticsSaleCtl", ["$scope", "$timeout", "ComView", "StatisticsSaleRes", "$rootScope", "GridView",
            function($scope, $timeout, ComView, res, $rootScope, GridView){

                //变量预设
                var startTime = new Date();
                var endTime = new Date();
                startTime.setMonth(startTime.getMonth()-1);
                $scope.filterFormData = $scope.filterFormData || {};
                $scope.filterFormData._filter_start_dateline = startTime;
                $scope.filterFormData._filter_end_dateline = endTime;
                $scope.filterFormData._filter_timeStep = "day";
                var filters = {
                    between: {
                        field: "dateline",
                        defaultData: [getDateForInput(startTime), getDateForInput(endTime)],
                        inputType: "datetime"
                    },
                    select: {
                        field: "timeStep",
                        inputType: "select",
                        displayName: l('lang.showType'),
                        dataSource: [
                            {id: "day", name: l('lang.show_by_day')},
                            {id: "month", name: l('lang.show_by_month')},
                            {id: "year", name: l('lang.show_by_year')}
                        ]
                    }
                };

                //page desc
                $scope.$parent.currentPage.actionDesc = sprintf("%s ~ %s",
                    toDate($scope.filterFormData._filter_start_dateline/1000, true), toDate($scope.filterFormData._filter_end_dateline/1000, true)
                );

                $scope.selectAble = false;

                //过滤器
                GridView.methodsList.makeFilters($scope, filters);
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
                    res.query($scope.filterFormData).$promise.then(function(data){
                        $scope.barData = data;
                    });
                };

                doQuery();
            }])
    ;
})();