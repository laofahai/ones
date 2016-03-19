(function(window, angular, ones, io){
    'use strict';
    angular.module('ones.app.finance.model', [
        'ones.app.finance.receivables',
        'ones.app.finance.payables'
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
                    }
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
                        amount: {
                            cell_filter: "to_money_display",
                            grid_fixed: true
                        },
                        payment_method: {
                            grid_fixed: true,
                            data_source: 'Home.CommonTypeAPI',
                            data_source_query_param: {
                                _mf: 'module',
                                _mv: 'finance_payment_method'
                            }
                        },
                        direction: {
                            cell_filter: 'to_balance_direction_icon',
                            width: 80,
                            label: _('finance.Balance Direction'),
                            align: 'center',
                            grid_fixed: true
                        },
                        finance_account_id: {
                            data_source: 'Finance.FinanceAccountAPI',
                            grid_fixed: true
                        },
                        user_info_id: {
                            cell_filter: "to_user_fullname"
                        }
                    },
                    filters: {
                        finance_account_id: {
                            type: 'link'
                        },
                        direction: {
                            type: 'link'
                        },
                        payment_method: {
                            type: 'link'
                        }
                    },
                    addable: false,
                    editable: false,
                    list_hide: ['source_id']
                };

                this.config.fields.direction.data_source =  [
                    {label: $filter('to_balance_direction_icon')(1), value: 1},
                    {label: $filter('to_balance_direction_icon')(2), value: 2}
                ]

            }
        ])
    ;

})(window, window.angular, window.ones, window.io);