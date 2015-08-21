(function(window, angular, ones, io){
    'use strict';
    angular.module('ones.app.storage.model', [])

        .service('Storage.StorageAPI', [
            'ones.dataApiFactory',
            function(dataAPI) {
                this.resource = dataAPI.getResourceInstance({
                    uri: 'storage/storage',
                    extra_methods: ['api_get', 'api_query']
                });

                this.config = {
                    app: 'storage',
                    module: 'storage',
                    table: 'storage',

                    fields: {
                        last_check_time: {
                            widget: 'datetime',
                            editable: false,
                            label: _('storage.Storage Last Check Time'),
                            cell_filter: 'to_human_date'
                        }
                    },

                    list_display: ['name', 'last_check_time', 'phone']
                };

            }
        ])

        .service('Storage.StockAPI', [
            'ones.dataApiFactory',
            '$q',
            function(dataAPI, $q) {
                this.resource = dataAPI.getResourceInstance({
                    uri: 'storage/stock',
                    extra_methods: ['api_get']
                });

                this.config = {
                    app: 'storage',
                    module: 'stock',
                    table: 'stock',
                    fields: {
                        balance: {
                            label: _('storage.Stock Balance'),
                            get_display: function(value, item) {
                                return to_decimal_display(value) + ' ' + item.measure_unit;
                            }
                        },
                        total_balance: {
                            label: _('storage.Stock Balance Total'),
                            get_display: function(value, item) {
                                return to_decimal_display(value) + ' ' + item.measure_unit;
                            },
                            addable: false,
                            editable: false
                        },
                        product_id: {
                            get_display: function(value, item) {
                                return item.product_name;
                            },
                            search_able: true,
                            search_able_fields: 'Product.name',
                            label: _('product.Product')
                        },
                        storage_id: {
                            get_display: function(value, item) {
                                return item.storage_name;
                            }
                        }
                    },
                    list_display: [
                        'product_id', 'storage_id', 'balance', 'total_balance'
                    ],
                    filters: {
                        storage_id: {
                            type: 'link',
                            data_source: 'Storage.StorageAPI'
                        }
                    },
                    addable: false,
                    editable: false
                };

                // 获取某产品当前库存余量
                this.get_stock_quantity = function(row_data) {
                    var params = {};
                    var ignore = ['tr_id', 'remark', 'quantity'];
                    angular.forEach(row_data, function(v, k) {
                        if(k.slice(-2) === '__' || ignore.indexOf(k) >= 0) {
                            return;
                        }
                        params[k] = v;
                    });

                    dataAPI.init('storage', 'stock/get_quantity_balance');
                    return dataAPI.resource.api_get(params).$promise;
                };
            }
        ])
        .service('Storage.StockLogAPI', [
            'ones.dataApiFactory',
            function(dataAPI) {
                this.resource = dataAPI.getResourceInstance({
                    uri: 'storage/stockLog'
                });

                this.config = {
                    app: 'storage',
                    module: 'stockLog',
                    table: 'stock_log',
                    addable: false,
                    editable: false,
                    deleteable: false,
                    fields: {
                        direction: {
                            get_display: function(value) {
                                var $class = 'fa fa-';
                                switch(value) {
                                    case "in":
                                        $class += 'plus-square text-success';
                                        break;
                                    case "out":
                                        $class += 'minus-square text-danger';
                                        break;
                                    default:
                                        return value;
                                }

                                return sprintf('<i class="%s"></i> ', $class);
                            },
                            width: 80,
                            label: _('storage.Balance Direction'),
                            align: 'center'
                        },
                        bill_no: {

                        },
                        quantity: {
                            get_display: function(value, item) {
                                return to_decimal_display(value) + ' ' + (item.measure_unit || '');
                            }
                        },
                        user_id: {
                            cell_filter: 'to_user_fullname'
                        },
                        product_name: {
                            label: _('product.Product'),
                            search_able: true
                        },
                        storage_id: {
                            get_display: function(value, item) {
                                return item.storage_name;
                            },
                            data_source: 'Storage.StorageAPI'
                        }
                    },
                    list_display: [
                        'storage_id',
                        'bill_no',
                        'product_name',
                        'direction',
                        'quantity',
                        'created',
                        'user_id'
                    ],
                    filters: {
                        storage_id: {
                            type: 'link'
                        }
                    }
                };
            }
        ])

    ;

})(window, window.angular, window.ones, window.io);