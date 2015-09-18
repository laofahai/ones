(function(window, angular, ones, io){
    /*
     * @app saleAnalytics
     * @author laofahai@TEam Swift
     * @link https://ng-erp.com
     * */
    'use strict';
    angular.module('ones.app.saleAnalytics.model', [])
        .service('SaleAnalytics.SaleVolumeAPI', [
            'ones.dataApiFactory',
            function(dataAPI) {
                this.resource = dataAPI.getResourceInstance({
                    uri: 'saleAnalytics/saleVolume'
                });

                this.config = {};
            }
        ])
        .service('SaleAnalytics.SaleBoardAPI', [
            'ones.dataApiFactory',
            function(dataAPI) {
                this.resource = dataAPI.getResourceInstance({
                    uri: 'saleAnalytics/saleBoard'
                });

                this.config = {};
            }
        ])
    ;

})(window, window.angular, window.ones, window.io);