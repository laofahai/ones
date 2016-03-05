(function(window, angular, ones) {

    angular.module('ones.app.finance.payables', [])
        .service('Finance.PayablesAPI', [
            'ones.dataApiFactory',
            function(dataAPI) {
                this.resource = dataAPI.getResourceInstance({
                    uri: 'finance/payables'
                });

                this.config = {
                    app: 'finance',
                    module: 'payables',
                    table: 'payables',
                    fields: {}
                };
            }
        ])
    ;

})(window, window.angular, window.ones);