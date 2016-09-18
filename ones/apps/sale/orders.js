(function(window, angular, ones, io){
    /*
     * @app sale
     * @author laofahai@TEam Swift
     * @link http://ng-erp.com
     * */
    'use strict';
    angular.module('ones.app.sale.orders', ['ones.billModule', 'ones.app.storage.model'])
        .config(['$routeProvider', function($route) {
            $route
                .when('/sale/orders/add/bill', {
                    controller : 'SaleOrdersBillCtrl',
                    templateUrl: appView('orders_edit.html')
                })
                .when('/sale/orders/edit/bill/:id', {
                    controller : 'SaleOrdersBillCtrl',
                    templateUrl: appView('orders_edit.html')
                })
                .when('/sale/orders/:action/bill/:id', {
                    controller : 'SaleOrdersBillCtrl',
                    templateUrl: appView('orders_edit.html')
                })
                .when('/sale/orders/:action/bill/:id/node/:node_id', {
                    controller : 'SaleOrdersBillCtrl',
                    templateUrl: appView('orders_edit.html')
                })
            ;
        }])
        .controller('SaleOrdersBillCtrl', [
            '$scope',
            '$timeout',
            'Sale.OrdersAPI',
            'Sale.OrdersDetailAPI',
            'Product.ProductAPI',
            'Bpm.WorkflowAPI',
            'BillModule',
            '$routeParams',
            '$q',
            '$injector',
            'RootFrameService',
            '$parse',
            function($scope, $timeout, order_api, order_detail_api, product_api,
                     workflow_api, bill, $routeParams, $q, $injector, RootFrameService, $parse) {

                if(!$routeParams.id) {
                    $scope.bill_meta_data = {
                        created: new Date(moment().format()),
                        user_info_id: ones.user_info.id
                    };
                } else {
                    $scope.bill_meta_data = {};
                }

                if($routeParams.id) {
                    $scope.is_edit = true;
                }

                // 产品属性
                if(is_app_loaded('productAttribute')) {
                    $injector.get('ProductAttribute.ProductAttributeAPI').assign_attributes(order_detail_api);
                }

                // bill基本配置
                $scope.bill_config = {
                    model: order_api,
                    subject: _('sale.Orders'),
                    bill_no: {
                        value: generate_bill_no('XS')
                    }
                };

                switch($routeParams.action) {
                    case 'view':
                        $scope.is_view = true;
                        $scope.bill_meta_data.locked = true;
                        break;
                }

                // 查询当前库存
                $scope.fetch_stock_quantity = function(row_data, row_scope, row_index) {
                    if(is_app_loaded('storage')) {
                        $injector.get('Storage.StockAPI').get_stock_quantity(row_data[row_index]).then(function(response_data) {
                            var getter = $parse('bill_rows['+row_index+'].stock_quantity__label__');
                            getter.assign(row_scope, to_decimal_display(response_data.quantity_balance));

                            var unit_measure_result = to_product_measure_unit(product_api, $q, row_data[row_index]);
                            var after_getter = $parse('bill_rows['+row_index+'].stock_quantity__after__');
                            if(typeof unit_measure_result === 'object') {
                                unit_measure_result.then(function(measure) {
                                    after_getter.assign(row_scope, measure);
                                });
                            } else if(typeof unit_measure_result === 'string') {
                                after_getter.assign(row_scope, unit_measure_result);
                            }
                        });
                    }
                };

                var total_able_fields = [];
                angular.forEach(order_detail_api.config.fields, function(config, field) {
                    if(config.total_able) {
                        total_able_fields.push(field);
                    }
                });

                // 计算小计
                $scope.re_calculate_subtotal = function(rows, row_scope, row_index) {
                    bill.common_methods.re_calculate_subtotal($scope, rows, row_scope, row_index);
                    $scope.re_calculate_total(rows);
                };

                // 计算合计
                $scope.re_calculate_total = function(rows, update_net_receive) {
                    bill.common_methods.re_calculate_total($scope, rows, total_able_fields,
                        update_net_receive === false ? false : 'net_receive');
                };

                // 取得商品单价
                $scope.fetch_unit_price = function(rows, row_scope, row_index, $event) {

                    $timeout(function() {
                        if($event && $event.keyCode !== KEY_CODES.enter) {
                            return;
                        }

                        if(!rows[row_index].product_id) {
                            return;
                        }
                        var params = {
                            _m: 'fetch_product_unit_price'
                        };
                        angular.forEach(rows[row_index], function(v, k) {
                            if(k.end_with('__') || k == 'tr_id') {
                                return;
                            }
                            params[k] = v;
                        });

                        product_api.resource.api_get(params).$promise.then(function(response_data) {
                            var getter = $parse('bill_rows['+row_index+'].unit_price');
                            var label_getter = $parse('bill_rows['+row_index+'].unit_price__label__');
                            var price = response_data['sale_price'] || response_data['source_price'];
                            getter.assign(row_scope, price);
                            label_getter.assign(row_scope, to_decimal_display(price));
                        });
                    });

                };

                // 日期输入
                $scope.date_config = {
                    field: 'created',
                    widget: 'datetime',
                    'ng-model': 'bill_meta_data.created',
                    group_tpl: BILL_META_INPUT_GROUP_TPL
                };

                // 客户选择
                $scope.customer_config = {
                    label: _('crm.Customer'),
                    field: 'customer_id',
                    widget: 'select3',
                    'ng-model': 'bill_meta_data.customer_id',
                    data_source: 'Crm.CustomerAPI',
                    value_field: 'customer_id',
                    id: 'sale_orders_customer_id_input',
                    group_tpl: '<div class="input-group"><span class="input-group-addon">%(label)s</span><div class="select3-container-box">%(input)s</div></div>',
                    scope: $scope,
                    data_source_value_field: 'customer_id'
                };

                // 实付金额
                $scope.net_receive_amount_config = {
                    label: _('common.Net Total Payment Amount'),
                    field: 'net_receive',
                    widget: 'number',
                    'ng-model': 'bill_meta_data.net_receive',
                    group_tpl: BILL_META_INPUT_GROUP_TPL
                };

                // 工作流选择
                $scope.workflow_config = {
                    label: _('bpm.Workflow'),
                    field: 'workflow_id',
                    widget: 'select',
                    'ng-model': 'bill_meta_data.workflow_id',
                    data_source: 'Bpm.WorkflowAPI',
                    data_source_query_param: {
                        _mf: 'module',
                        _mv: 'sale.orders'
                    },
                    group_tpl: BILL_META_INPUT_GROUP_TPL
                };

            }
        ])
    ;

ones.global_module
    .service('Sale.OrdersAPI', [
        'ones.dataApiFactory',
        '$injector',
        function(dataAPI, $injector) {

            this.resource = dataAPI.getResourceInstance({
                uri: 'sale/orders'
            });

            this.config = {
                app: 'sale',
                module: 'orders',
                table: 'orders',
                is_bill: true,
                detail_able: true,
                workflow: 'sale.orders',
                bill_row_model: 'Sale.OrdersDetailAPI',
                fields: {
                    bill_no: {
                        search_able: true,
                        grid_fixed: true
                    },
                    subject: {
                        search_able: true,
                        grid_fixed: true
                    },
                    status: {
                        addable: false,
                        editable: false,
                        get_display: function(value, item) {
                            return item.workflow_node_status_label;
                        }
                    },
                    quantity: {
                        get_display: function(value, item) {
                            return to_decimal_display(value);
                        }
                    },
                    net_receive: {
                        get_display: function(value, item) {
                            return to_decimal_display(value);
                        },
                        label: _('common.Net Total Receive Amount')
                    },
                    user_info_id: {
                        cell_filter: 'to_user_fullname'
                    },
                    created: {
                        widget: 'datetime'
                    },
                    workflow_id: {
                        data_source: 'Bpm.WorkflowAPI',
                        data_source_query_param: {
                            _mf: 'module',
                            _mv: 'sale.orders',
                            _fd: 'id,name'
                        }
                    },
                    customer_id: {
                        label: _('crm.Customer')
                    }
                },
                bill_meta_required: [
                    'subject', 'created', 'customer_id'
                ],
                filters: {
                    workflow_id: {
                        type: 'link'
                    },
                    by_user: {
                        label: _('common.User'),
                        type: 'link',
                        data_source: window.DEAL_USER_DATASOURCE
                    }
                },
                sortable: [
                    'created', 'net_receive', 'quantity', 'status'
                ],
                list_hide: ['source_id', 'remark', 'currency']
            };

            if(is_app_loaded('printer')) {
                this.config.extra_selected_actions = [];
                var printer = $injector.get('ones.printerModule');
                printer.generate_selected_print_action(this.config.extra_selected_actions, 'sale', 'orders');
            }
        }
    ])
    .service('Sale.OrdersDetailAPI', [
        'ones.dataApiFactory',
        'Product.ProductAPI',
        '$q',
        function(dataAPI, product, $q) {
            this.resource = dataAPI.getResourceInstance({
                uri: 'sale/ordersDetail'
            });

            this.config = {
                app: 'sale',
                module: 'ordersDetail',
                table: 'orders_detail',
                fields: {
                    product_id: {
                        label: _('product.Product')
                        , widget: 'select3'
                        , data_source: 'Product.ProductAPI'
                        , auto_query: false
                        , get_display: function() {
                            return false;
                        }
                        , 'ng-blur': '$parent.$parent.$parent.fetch_unit_price(bill_rows, $parent.$parent, $parent.$index)'
                        , 'ng-keydown': '$parent.$parent.$parent.fetch_unit_price(bill_rows, $parent.$parent, $parent.$index, $event)'
                    }
                    , remark: {
                        label: _('common.Remark')
                        , blank: true
                        , editable_required: 'product_id'
                        , force_editable: true
                    }
                    , stock_quantity: {
                        widget: 'static',
                        width:200,
                        label: _('sale.Stock Quantity'),
                        get_display: function(value, item) {
                            return to_decimal_display(value);
                        },
                        get_bill_cell_after: function(value, item) {
                            return to_product_measure_unit(product, $q, item);
                        },
                        editable: false
                    }
                    , unit_price: {
                        label: _('common.Unit Price'),
                        widget: 'number'
                        , get_display: function(value, item) {
                            return to_decimal_display(value);
                        },
                        'ng-blur': '$parent.$parent.$parent.re_calculate_subtotal(bill_rows, $parent.$parent, $parent.$index)'
                    }
                    , quantity: {
                        label: _('common.Quantity')
                        , widget: 'number'
                        , get_display: function(value, item) {
                            return to_decimal_display(value);
                        }
                        // 单元格后置计量单位
                        , get_bill_cell_after: function(value, item) {
                            return to_product_measure_unit(product, $q, item);
                        },
                        'ng-blur': '$parent.$parent.$parent.fetch_stock_quantity(bill_rows, $parent.$parent, $parent.$index);$parent.$parent.$parent.re_calculate_subtotal(bill_rows, $parent.$parent, $parent.$index)',
                        editable_required: 'product_id'
                        , total_able: true
                    }
                    , subtotal_amount: {
                        editable: false
                        , label: _('common.Subtotal Amount')
                        , get_display: function(value, item) {
                            return to_decimal_display(value);
                        }
                        , total_able: true
                    }
                },
                bill_fields: [
                    'product_id'
                    , 'unit_price'
                    ,'quantity'
                    , 'subtotal_amount'
                    ,'remark'
                ],

                bill_row_required: [
                    'product_id', 'quantity'
                ]
            };

            if(is_app_loaded('storage')) {
                this.config.bill_fields.splice(this.config.bill_fields.indexOf('quantity')+1, 0, 'stock_quantity');
            }
        }
    ])
;

})(window, window.angular, window.ones, window.io);