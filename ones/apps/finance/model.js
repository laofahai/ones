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
        .service('Finance.FinanceStreamlineAPI', [
            'ones.dataApiFactory',
            '$filter',
            function(dataAPI, $filter) {

                this.resource = dataAPI.getResourceInstance({
                    uri: "finance/financeStreamline",
                    extra_methods: ['api_query']
                });

                this.config = {
                    app: "finance",
                    module: "financeStreamline",
                    table: "finance_streamline",
                    fields: {
                        direction: {
                            cell_filter: 'to_balance_direction_icon',
                            width: 80,
                            label: _('finance.Balance Direction'),
                            align: 'center'
                        },
                        amount: {
                            cell_filter: "to_money_display"
                        },
                        finance_account_id: {
                            data_source: 'Finance.FinanceAccountAPI'
                        },
                        user_info_id: {
                            cell_filter: "to_user_fullname"
                        }
                    },
                    list_display: [
                        'direction',
                        'amount',
                        'finance_account_id',
                        'created',
                        'user_info_id'
                    ],
                    filters: {
                        finance_account_id: {
                            type: 'link'
                        },
                        direction: {
                            type: 'link'
                        }
                    },
                    addable: false,
                    editable: false
                };

                this.config.fields.direction.data_source =  [
                    {label: $filter('to_balance_direction_icon')(1), value: 1},
                    {label: $filter('to_balance_direction_icon')(2), value: 2}
                ]

            }
        ])
    ;

})(window, window.angular, window.ones, window.io);