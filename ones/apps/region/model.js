(function(window, angular, ones, io){
    /*
     * @app region
     * @author laofahai@TEam Swift
     * @link http://ng-erp.com
     * */
    'use strict';
    ones.global_module
        .service('Region.RegionAPI', [
            'ones.dataApiFactory',
            function(dataAPI) {
                this.resource = dataAPI.getResourceInstance({
                    uri: 'region/region',
                    extra_methods: ['api_get', 'api_query']
                });

                this.get_full_name = function(region_id) {
                    return this.resource.api_get({_m: 'get_full_name', id: region_id}).$promise;
                };
            }
        ])
    ;

})(window, window.angular, window.ones, window.io);