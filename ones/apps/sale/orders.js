(function(window, angular, ones, io){
    /*
     * @app sale
     * @author laofahai@TEam Swift
     * @link https://ng-erp.com
     * */
    'use strict';
    angular.module('ones.app.sale.orders', ['ones.billModule', 'ones.app.crm.model', 'ones.app.storage.model'])
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
            function($scope, $timeout, order_api, order_detail_api, product_api, workflow_api, bill, $routeParams, $q, $injector, RootFrameService, $parse) {

                if(!$routeParams.id) {
                    $scope.bill_meta_data = {
                        created: new Date(moment().format()),
                        user_id: ones.user_info.id
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
                        $injector.get('Storage.StockAPI').get_stock_quantity(row_data).then(function(response_data) {
                            var getter = $parse('bill_rows['+row_index+'].stock_quantity__label__');
                            getter.assign(row_scope, to_decimal_display(response_data.quantity_balance));
                        });
                    }
                };

                // 日期输入
                $scope.date_config = {
                    field: 'created',
                    widget: 'datetime',
                    'ng-model': 'bill_meta_data.created',
                    group_tpl: '<div class="input-group"><span class="input-group-addon">%(label)s</span>%(input)s</div>'
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
                    group_tpl: '<div class="input-group"><span class="input-group-addon">%(label)s</span>%(input)s</div>'
                };

            }
        ])
        .service('Sale.OrdersAPI', [
            'ones.dataApiFactory',
            function(dataAPI) {
                this.resource = dataAPI.getResourceInstance({
                    uri: 'sale/orders'
                });

                this.config = {
                    app: 'sale',
                    module: 'orders',
                    table: 'orders',
                    is_bill: true,
                    detailable: true,
                    workflow: 'sale.orders',
                    bill_row_model: 'Sale.OrdersDetailAPI',
                    fields: {
                        workflow_node_status_label: {
                            label: _('common.Status'),
                            addable: false,
                            editable: false,
                            data_source: [
                                {value: 0, label: _('sale.ORDERS_STATUS_NEW')},
                                {value: 1, label: _('sale.ORDERS_STATUS_SAVED')},
                                {value: 2, label: _('sale.ORDERS_STATUS_COMPLETE')}
                            ],
                            map: 'status'
                        },
                        quantity: {
                            get_display: function(value, item) {
                                return to_decimal_display(value);
                            }
                        },
                        user_id: {
                            cell_filter: 'to_user_fullname'
                        },
                        created: {
                            widget: 'datetime'
                        }
                    },
                    list_display: [
                        'bill_no',
                        'subject',
                        'source_model',
                        'quantity',
                        'created',
                        'workflow_node_status_label',
                        'user_id'
                    ],
                    bill_meta_required: [
                        'subject', 'created'
                    ],
                    filters: {
                        workflow_node_status_label: {
                            type: 'link'
                        }
                    }
                };
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
                            'ng-blur': '$parent.$parent.$parent.fetch_stock_quantity(bill_rows[$parent.$index], $parent.$parent, $parent.$index)',
                            editable_required: 'product_id'
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
                    },
                    bill_fields: [
                        'product_id'
                        ,'quantity'
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