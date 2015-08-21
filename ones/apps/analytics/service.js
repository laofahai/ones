(function(window, angular, ones, io){
    /*
     * @app analytics
     * @author laofahai@TEam Swift
     * @link https://ng-erp.com
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

        .service('ones.analyticsService', [
            function() {

                var self = this;

                this.chart = {};
                this.options = {};

                this.init = function(element_id) {
                    this.chart = echarts.init(document.getElementById(element_id));
                };


                this.set_property = function() {};

            }
        ])
    ;

})(window, window.angular, window.ones, window.io);