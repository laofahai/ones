(function(window, angular, ones, io){
    /*
     * @app saleAnalytics
     * @author laofahai@TEam Swift
     * @link http://ng-erp.com
     * */
    'use strict';
    angular.module('ones.app.saleAnalytics.main', [

    ])
        .config(['$routeProvider', function($route) {
            $route
                .when('/saleAnalytics/saleVolume', {
                    controller: 'SaleVolumeAnalyticsCtrl',
                    templateUrl: appView('sale_volume.html')
                })
                .when('/saleAnalytics/saleBoard', {
                    controller: 'SaleBoardAnalyticsCtrl',
                    templateUrl: appView('sale_board.html')
                })
            ;
        }])
    ;
    ones.global_module
        // 销售额统计
        .controller('SaleVolumeAnalyticsCtrl', [
            '$scope',
            'AnalyticsService',
            '$routeParams',
            'SaleAnalytics.SaleVolumeAPI',
            'Account.DepartmentAPI',
            'RootFrameService',
            function($scope, analytics, $routeParams, volume_api, department_api, RootFrameService) {
                analytics.init($scope);

                var options = {
                    title: {
                        text: "", subtext: ""
                    },
                    legend: {
                        data: [
                            _('saleAnalytics.Sale Amount'),
                            _('saleAnalytics.Sale Quantity')
                        ]
                    },
                    tooltip: {
                        trigger: 'axis'
                    },
                    toolbox: {
                        show: true,
                        feature: {
                            mark: {show: true},
                            magicType: {show: true, type: ['line', 'bar']},
                            restore: {show: true},
                            saveAsImage: {show: true}
                        }
                    },
                    calculable: true,
                    xAxis: [{type: 'category', data: [], boundaryGap: false}],
                    yAxis: [{type: 'value'}],
                    series: [
                        {
                            name: _('saleAnalytics.Sale Amount'),
                            type: 'bar',
                            data: [],
                            markPoint: {
                                data: [
                                    {type: 'max', name: _('analytics.Max Value')},
                                    {type: 'min', name: _('analytics.Min Value')}
                                ]
                            },
                            markLine: {
                                data: [
                                    {type: 'average', name: _('analytics.Avg Value')}
                                ]
                            }
                        },
                        {
                            name: _('saleAnalytics.Sale Quantity'),
                            type: 'bar',
                            data: [],
                            markPoint: {
                                data: [
                                    {type: 'max', name: _('analytics.Max Value')},
                                    {type: 'min', name: _('analytics.Min Value')}
                                ]
                            },
                            markLine: {
                                data: [
                                    {type: 'average', name: _('analytics.Avg Value')}
                                ]
                            }
                        }
                    ]
                };

                var data_query_params = {};
                switch($routeParams.type) {
                    case "date":
                    default:
                        data_query_params._m = 'get_data_by_date';
                        break;
                }

                $scope.time_dimensions = analytics.time_dimensions;
                $scope.active_time_dimension = false;

                // 切换时间维度
                $scope.switch_dimensions = function(index, dimension) {
                    $scope.active_time_dimension = index;
                    dimension = dimension || $scope.time_dimensions[index];
                    options.title.text =  _('saleAnalytics.Sale Analytics') + ' - ' + dimension.label;
                    do_query(dimension);
                };
                // 修改时间区间
                $scope.change_date_range = function() {
                    if(!$scope.date_start || !$scope.date_end || $scope.date_start > $scope.date_end) {
                        return RootFrameService.alert({
                            content: _('analytics.Please select time period correctly')
                        });
                    }
                    data_query_params.st = $scope.date_start;
                    data_query_params.et = $scope.date_end;
                    do_query();
                };

                // 按部门查看
                $scope.departments = [{id:0,label:_('common.All')}];
                $scope.active_department = 0;
                department_api.resource.api_query().$promise.then(function(data) {
                    angular.forEach(data, function(item) {
                        $scope.departments.push({
                            id: item.id,
                            label: item.prefix_name || item.name
                        });
                    });
                });
                $scope.switch_department = function(index, department) {
                    $scope.active_department = index;
                    if(index > 0) {
                        data_query_params.dept = department.id;
                    } else {
                        data_query_params.dept = undefined;
                    }

                    do_query();
                };

                // 数据查询
                var do_query = function(dimension) {
                    dimension = dimension || $scope.time_dimensions[$scope.active_time_dimension] || {};
                    data_query_params['dimension'] = dimension.value || 'day';
                    volume_api.resource.get(data_query_params).$promise.then(function(response_data) {
                        options.title.subtext = response_data.subtext;
                        options.xAxis[0].data = response_data.xAxis || [];
                        options.series[0].data = response_data.data.amount;
                        options.series[1].data = response_data.data.quantity;

                        analytics.chart.clear();
                        analytics.chart.setOption(options);

                    });
                };

                $scope.switch_dimensions(0);
            }
        ])

        // 销售排行
        .controller('SaleBoardAnalyticsCtrl', [
            '$scope',
            'AnalyticsService',
            '$routeParams',
            'SaleAnalytics.SaleBoardAPI',
            'RootFrameService',
            function($scope, analytics, $routeParams, board_api, RootFrameService) {
                analytics.init($scope);

                var data_query_params = {
                    _m: 'get_data'
                };

                // 配置
                var options = {
                    title: {
                        text: "", subtext: ""
                    },
                    legend: {
                        data: [
                            _('saleAnalytics.Sale Amount'),
                            _('saleAnalytics.Sale Quantity')
                        ]
                    },
                    tooltip: {
                        trigger: 'axis'
                    },
                    toolbox: {
                        orient : 'vertical',
                        x: 'right',
                        show: true,
                        feature: {
                            mark: {show: true},
                            magicType: {show: true, type: ['line', 'bar']},
                            restore: {show: true},
                            saveAsImage: {show: true}
                        }
                    },
                    calculable: true,
                    xAxis: [{type: 'category', data: [], boundaryGap: false}],
                    yAxis: [{type: 'value'}],
                    series: [
                        {
                            name: _('saleAnalytics.Sale Amount'),
                            type: 'bar',
                            data: [],
                            markPoint: {
                                data: [
                                    {type: 'max', name: _('analytics.Max Value')},
                                    {type: 'min', name: _('analytics.Min Value')}
                                ]
                            },
                            markLine: {
                                data: [
                                    {type: 'average', name: _('analytics.Avg Value')}
                                ]
                            }
                        },
                        {
                            name: _('saleAnalytics.Sale Quantity'),
                            type: 'bar',
                            data: [],
                            markPoint: {
                                data: [
                                    {type: 'max', name: _('analytics.Max Value')},
                                    {type: 'min', name: _('analytics.Min Value')}
                                ]
                            },
                            markLine: {
                                data: [
                                    {type: 'average', name: _('analytics.Avg Value')}
                                ]
                            }
                        }
                    ]
                };

                // 查询数量
                $scope.limit = 10;

                // 修改时间区间
                $scope.change_date_range = function() {
                    if(!$scope.date_start || !$scope.date_end || $scope.date_start > $scope.date_end) {
                        return RootFrameService.alert({
                            content: _('analytics.Please select time period correctly')
                        });
                    }
                    data_query_params.st = $scope.date_start;
                    data_query_params.et = $scope.date_end;
                    data_query_params.limit = $scope.limit;
                    do_query();
                };

                // 排序方式
                $scope.active_sort_type = 0;
                $scope.sort_types = [
                    {label: _('saleAnalytics.Sort by sale amount'), value: 'amount'},
                    {label: _('saleAnalytics.Sort by sale quantity'), value: 'quantity'}
                ];
                $scope.switch_sort_types = function(index, type) {
                    $scope.active_sort_type = index;
                    data_query_params.sort_by = type.value;
                    options.title.text = _('saleAnalytics.Sale Board') + '-' + type.label;
                    do_query();
                };

                // 数据查询
                var do_query = function() {
                    board_api.resource.get(data_query_params).$promise.then(function(response_data) {

                        options.title.subtext = response_data.subtext;
                        options.xAxis[0].data = response_data.xAxis || [];
                        options.series[0].data = response_data.data.amount;
                        options.series[1].data = response_data.data.quantity;

                        analytics.chart.clear();
                        analytics.chart.setOption(options);

                    });
                };

                $scope.switch_sort_types($scope.active_sort_type, $scope.sort_types[$scope.active_sort_type]);
            }
        ])
    ;

})(window, window.angular, window.ones, window.io);