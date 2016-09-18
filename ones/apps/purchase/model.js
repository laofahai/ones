(function(window, angular, ones, io){
    /*
     * @app purchase
     * @author laofahai@TEam Swift
     * @link http://ng-erp.com
     * */
    'use strict';
    angular.module('ones.app.purchase.model', [])
        .service('Purchase.PurchaseAPI', [
            'ones.dataApiFactory',
            '$injector',
            function(dataAPI, $injector) {
                this.resource = dataAPI.getResourceInstance({
                    uri: 'purchase/purchase'
                });

                this.config = {
                    app: 'purchase',
                    module: 'purchase',
                    table: 'purchase',
                    is_bill: true,
                    detail_able: true,
                    workflow: 'purchase.purchase',
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
                        user_info_id: {
                            cell_filter: 'to_user_fullname'
                        },
                        created: {
                            widget: "datetime"
                        },
                        supplier_id: {
                            label: _('supplier.Supplier'),
                            widget: 'select3',
                            data_source: 'Supplier.SupplierAPI',
                            editable_required: 'product_id',
                            search_able: true,
                            search_able_fields: 'ContactsCompany.name'
                        },
                        workflow_id: {
                            data_source: 'Bpm.WorkflowAPI',
                            data_source_query_param: {
                                _mf: 'module',
                                _mv: 'purchase.purchase',
                                _fd: 'id,name'
                            }
                        }
                    },
                    list_hide: [
                        'source_id', 'remark'
                    ],
                    bill_row_model: 'Purchase.PurchaseDetailAPI',
                    bill_meta_required: [
                        'subject', 'created', 'supplier_id'
                    ],
                    sortable: [
                        'created', 'quantity'
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
                    }
                };

                if(is_app_loaded('printer')) {
                    this.config.extra_selected_actions = [];
                    var printer = $injector.get('ones.printerModule');
                    printer.generate_selected_print_action(this.config.extra_selected_actions, 'purchase', 'purchase');
                }
            }
        ])
        .service('Purchase.PurchaseDetailAPI', [
            'ones.dataApiFactory',
            'Product.ProductAPI',
            '$q',
            function(dataAPI, product, $q) {
                this.resource = dataAPI.getResourceInstance({
                    uri: 'purchase/purchaseDetail'
                });

                this.config = {
                    app: 'purchase',
                    module: 'purchaseDetail',
                    table: 'purchase_detail',
                    fields: {
                        product_id: {
                            label: _('product.Product')
                            , widget: 'select3'
                            , data_source: 'Product.ProductAPI'
                            , auto_query: false
                            , get_display: function() {
                                return false;
                            },
                            'ng-blur': '$parent.$parent.$parent.fetch_unit_price(bill_rows, $parent.$parent, $parent.$index, $event)',
                            'ng-keydown': '$parent.$parent.$parent.fetch_unit_price(bill_rows, $parent.$parent, $parent.$index, $event)'
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
                            'ng-blur': '$parent.$parent.$parent.re_calculate_subtotal(bill_rows, $parent.$parent, $parent.$index)',
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
                        , remark: {
                            label: _('common.Remark')
                            , blank: true
                            , editable_required: 'product_id'
                            , force_editable: true
                        }
                    },
                    bill_fields: [
                        'product_id'
                        , 'unit_price'
                        , 'quantity'
                        , 'subtotal_amount'
                        , 'remark'
                    ],

                    bill_row_required: [
                        'product_id', 'quantity'
                    ]
                };
            }
        ])
    ;

})(window, window.angular, window.ones, window.io);