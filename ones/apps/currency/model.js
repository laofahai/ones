(function(window, angular, ones, io){
    'use strict';

    ones.global_module
        .service('Currency.CurrencyAPI', [
            'ones.dataApiFactory',
            function(dataAPI) {
                this.resource = dataAPI.getResourceInstance({
                    uri: "currency/currency",
                    extra_methods: ['api_get', 'api_query']
                });

                this.config = {
                    app: "currency",
                    module: "currency",
                    table: "currency",
                    value_field: "name",
                    fields: {

                    }
                };

                this.unicode = function(item) {
                    return sprintf('%s %s %s', _('currency.CURRENCIES.' + item.name), item.name, item.symbol);
                }
            }
        ])

    ;

})(window, window.angular, window.ones, window.io);