(function(window, angular, ones, io){
    /*
     * @app analytics
     * @author laofahai@TEam Swift
     * @link http://ng-erp.com
     * */
    'use strict';
    ones.global_module
        .config(['$routeProvider', function($route) {
            $route.
                when('/:app/:module/analytics/by/:by_type', {
                    controller: 'CommonAnalyticsCtrl',
                    templateUrl: appView('common.html', 'analytics')
                })
            ;
        }])

        .controller('CommonAnalyticsCtrl', [
            '$scope',
            function($scope) {}
        ])

        .service('AnalyticsService', [
            function() {

                var self = this;

                this.chart = {};
                this.options = {};

                this.init = function($scope, element_id) {
                    this.$scope = $scope;
                    element_id = element_id || 'chart-container';
                    this.container = document.getElementById(element_id);
                    this.chart = echarts.init(this.container);
                };

                this.redraw = function(options) {
                    this.container.innerHTML = '';
                    this.chart.setOption(options);
                };

                // 时间维度
                this.time_dimensions = [
                    {label: _('analytics.View by month'), value: 'month'},
                    {label: _('analytics.View by day'), value: 'day'},
                    //{label: _('analytics.View by quarter'), value: 'quarter'},
                    {label: _('analytics.View by year'), value: 'year'}
                ];

            }
        ])
    ;

})(window, window.angular, window.ones, window.io);