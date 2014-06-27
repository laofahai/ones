(function() {
    'use strict';
    angular.module('ngHighcharts', []);
    angular.module('ngHighcharts').directive('highchart', function(highchart) {
        return {
            restrict: 'AE',
            replace: true,
            template: '<div></div>',
            scope: {
                data: '=',
                options: '='
            },
            link: function(scope, element, attrs) {

                var type = 'line';
                var title = '';
                var subtitle = '';
                var xAxisTitle = '';
                var yAxisTitle = '';
                var xAxisCategories = [];
                var series = [];
                var height = 600;
                var chartOptions = {};

                if (attrs.type) {
                    type = attrs.type.toLowerCase();
                }
                if (attrs.title) {
                    title = attrs.title;
                }
                if (attrs.subtitle) {
                    subtitle = scope.$parent.$eval(attrs.subtitle);
                }
                if (attrs.xTitle) {
                    xAxisTitle = attrs.xTitle;
                }
                if (attrs.yTitle) {
                    yAxisTitle = scope.$parent.$eval(attrs.yTitle);
                }
                if (attrs.categories) {
                    xAxisCategories = attrs.categories;
                }
                if (attrs.height) {
                    height = eval(attrs.height);
                }

                angular.extend(chartOptions, highchart.defaultOptions(), scope.options);
                
                if (chartOptions) {
                    chartOptions.chart.type = type;
                    chartOptions.title.text = title;
                    chartOptions.subtitle.text = subtitle;
                    chartOptions.xAxis.title.text = xAxisTitle;
                    chartOptions.yAxis.title.text = yAxisTitle;
                    chartOptions.chart.height = height;
                }

                scope.$watch('data', function(val) {
                    var temp = [];
                    series = [];
                    xAxisCategories = [];
                    for (var i = 0; i < val.length; i++) {

                        // categories
                        var item = val[i][attrs.categoryField];
                        if (xAxisCategories.length == 0 || xAxisCategories.indexOf(item) < 0) {
                            xAxisCategories.push(item);
                        }

                        // series
                        var obj = {};
                        obj.name = val[i][attrs.displayName];
                        obj.data = [];

                        for (var j = 0; j < val.length; j++) {
                            if (obj.name == val[j][attrs.displayName]) {
                                var value = val[j][attrs.yField];
                                obj.data.push(value);
                            }
                        }

                        if (series.length == 0 || temp.indexOf(obj.name) < 0) {
                            temp.push(obj.name);
                            series.push(obj);
                        }
                    }

                    chartOptions.xAxis.categories = eval(xAxisCategories);
                    if (chartOptions && chartOptions.series) {
                        chartOptions.series = series;
                        element.highcharts(chartOptions);
                    }
                });

            }
        }
    });

    angular.module('ngHighcharts').factory('highchart', function() {
        return {
            defaultOptions: function() {
                return {
                    chart: {
                        animation: true,
                        type: ''
                    },
                    title: {
                        text: ''
                    },
                    subtitle: {
                        text: ''
                    },
                    credits: {
                        enabled: false
                    },
                    legend: {
                        labelFormat: '{name}'
                    },
                    series: [],
                    xAxis: {
                        categories: [],
                        title: {
                            text: ''
                        }
                    },
                    yAxis: {
                        categories: null,
                        title: {
                            text: ''
                        }
                    }
                }
            }
        }
    });
})();
