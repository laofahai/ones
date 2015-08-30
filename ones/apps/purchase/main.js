(function(window, angular, ones, io){
    /*
     * @app purchase
     * @author laofahai@TEam Swift
     * @link https://ng-erp.com
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
            ;
        }])
        .controller('PurchaseBillCtrl', [
            '$scope',
            '$routeParams',
            '$injector',
            'Purchase.PurchaseAPI',
            'Purchase.PurchaseDetailAPI',
            function($scope, $routeParams, $injector, purchase_api, purchase_detail_api) {
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
                //$scope.customer_config = {
                //    label: _('crm.Customer'),
                //    field: 'customer_id',
                //    widget: 'select3',
                //    'ng-model': 'bill_meta_data.customer_id',
                //    data_source: 'Crm.CustomerAPI',
                //    value_field: 'customer_id',
                //    id: 'sale_orders_customer_id_input',
                //    group_tpl: '<div class="input-group"><span class="input-group-addon">%(label)s</span><div class="select3-container-box">%(input)s</div></div>',
                //    scope: $scope,
                //    data_source_value_field: 'customer_id'
                //};

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
                    group_tpl: '<div class="input-group"><span class="input-group-addon">%(label)s</span>%(input)s</div>'
                };
            }
        ])
    ;

})(window, window.angular, window.ones, window.io);