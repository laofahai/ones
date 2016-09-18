(function(window, angular, ones, io){
    /*
     * @app purchase
     * @author laofahai@TEam Swift
     * @link http://ng-erp.com
     * */
    'use strict';
    angular.module('ones.app.purchase.main', [
        'ones.app.purchase.model',
        'ones.billModule'
    ])
        .config(['$routeProvider', function($route) {
            $route
                .when('/purchase/purchase/add/bill', {
                    controller : 'PurchaseBillCtrl',
                    templateUrl: appView('purchase_edit.html')
                })
                .when('/purchase/purchase/edit/bill/:id', {
                    controller : 'PurchaseBillCtrl',
                    templateUrl: appView('purchase_edit.html')
                })
                .when('/purchase/purchase/:action/bill/:id', {
                    controller : 'PurchaseBillCtrl',
                    templateUrl: appView('purchase_edit.html')
                })
                .when('/purchase/purchase/:action/bill/:id/node/:node_id', {
                    controller : 'PurchaseBillCtrl',
                    templateUrl: appView('purchase_edit.html')
                })
            ;
        }])
        .controller('PurchaseBillCtrl', [
            '$scope',
            '$routeParams',
            '$injector',
            '$parse',
            '$timeout',
            'Supplier.SupplierAPI',
            'Product.ProductAPI',
            'Purchase.PurchaseAPI',
            'Purchase.PurchaseDetailAPI',
            function($scope, $routeParams, $injector, $parse, $timeout, supplier_api, product_api, purchase_api, purchase_detail_api) {
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
                    $injector.get('ProductAttribute.ProductAttributeAPI').assign_attributes(purchase_detail_api);
                }

                // bill基本配置
                $scope.bill_config = {
                    model: purchase_api,
                    subject: _('purchase.Purchase Bill'),
                    bill_no: {
                        value: generate_bill_no('CG')
                    }
                };

                switch($routeParams.action) {
                    case 'view':
                        $scope.is_view = true;
                        $scope.bill_meta_data.locked = true;
                        break;
                }

                var total_able_fields = [];
                angular.forEach(purchase_detail_api.config.fields, function(config, field) {
                    if(config.total_able) {
                        total_able_fields.push(field);
                    }
                });

                // 计算小计
                $scope.re_calculate_subtotal = function(rows, row_scope, row_index) {
                    if(!rows[row_index].quantity || !rows[row_index].unit_price) {
                        return;
                    }
                    var sub_total_getter = $parse('bill_rows['+row_index+'].subtotal_amount');
                    var sub_total_label_getter = $parse('bill_rows['+row_index+'].subtotal_amount__label__');
                    var sub_total = rows[row_index].quantity * rows[row_index].unit_price;
                    sub_total_getter.assign(row_scope, to_decimal_display(sub_total));
                    sub_total_label_getter.assign(row_scope, to_decimal_display(sub_total));

                    $scope.re_calculate_total(rows, row_scope, row_index);
                };

                // 计算合计
                $scope.re_calculate_total = function(rows, update_net_payment) {

                    update_net_payment = false === update_net_payment ? false : true;

                    var totals = {};
                    angular.forEach(rows, function(row) {
                        angular.forEach(row, function(v, k) {
                            if(total_able_fields.indexOf(k) >= 0) {
                                totals[k] = totals[k] || 0;
                                totals[k] += Number(v);
                            }
                        });
                    });

                    angular.forEach(totals, function(value, field) {
                        var getter = $parse('bill_meta_data.' + field + '__total__');
                        getter.assign($scope, value);

                        var label_getter = $parse('bill_meta_data.' + field + '__total____label__');
                        label_getter.assign($scope, to_decimal_display(value));
                    });

                    if(update_net_payment) {
                        $scope.bill_meta_data.net_payment = $scope.bill_meta_data.subtotal_amount__total__;
                    }
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
                            var price = response_data['purchase_price'] || response_data['source_price'];
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

                // 供应商选择
                $scope.supplier_config = {
                    label: _('supplier.Supplier'),
                    field: 'supplier_id',
                    widget: 'select3',
                    'ng-model': 'bill_meta_data.supplier_id',
                    data_source: 'Supplier.SupplierAPI',
                    value_field: 'supplier_id',
                    id: 'purchase_purchase_supplier_id_input',
                    group_tpl: '<div class="input-group"><span class="input-group-addon">%(label)s</span><div class="select3-container-box">%(input)s</div></div>',
                    scope: $scope,
                    data_source_value_field: 'supplier_id'
                };

                // 实付金额
                $scope.net_pay_amount_config = {
                    label: _('common.Net Total Payment Amount'),
                    field: 'net_payment',
                    widget: 'number',
                    'ng-model': 'bill_meta_data.net_payment',
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
                        _mv: 'purchase.purchase'
                    },
                    group_tpl: BILL_META_INPUT_GROUP_TPL
                };
            }
        ])
    ;

})(window, window.angular, window.ones, window.io);