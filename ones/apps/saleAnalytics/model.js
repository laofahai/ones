(function(window, angular, ones, io){
    /*
     * @app saleAnalytics
     * @author laofahai@TEam Swift
     * @link http://ng-erp.com
     * */
    'use strict';
    ones.global_module
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