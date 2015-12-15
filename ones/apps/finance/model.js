(function(window, angular, ones, io){
    'use strict';
    angular.module('ones.app.finance.model', [
        'ones.app.finance.receivables'
    ])
        .service('Finance.FinanceAccountAPI', [
            'ones.dataApiFactory',
            function(dataAPI) {
                this.resource = dataAPI.getResourceInstance({
                    uri: "finance/financeAccount",
                    extra_methods: ['api_query']
                });

                this.config = {
                    app: "finance",
                    module: "financeAccount",
                    table: "finance_account",
                    fields: {
                        balance: {
                            get_display: function(value, item) {
                                return to_decimal_display(value);
                            }
                        }
                    },
                    list_display: [
                        "name",
                        "balance",
                        "currency"
                    ]
                };
            }
        ])
    ;

})(window, window.angular, window.ones, window.io);