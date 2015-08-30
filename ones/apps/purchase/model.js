(function(window, angular, ones, io){
    /*
     * @app purchase
     * @author laofahai@TEam Swift
     * @link https://ng-erp.com
     * */
    'use strict';
    angular.module('ones.app.purchase.model', [])
        .service('Purchase.PurchaseAPI', [
            'ones.dataApiFactory',
            function(dataAPI) {
                this.resource = dataAPI.getResourceInstance({
                    uri: 'purchase/purchase'
                });

                this.config = {
                    app: 'purchase',
                    module: 'purchase',
                    table: 'purchase',
                    is_bill: true,
                    fields: {},
                    bill_row_model: 'Purchase.PurchaseDetailAPI',
                    bill_meta_required: [
                        'subject', 'created'
                    ]
                };
            }
        ])
        .service('Purchase.PurchaseDetailAPI', [
            'ones.dataApiFactory',
            function(dataAPI) {
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
            }
        ])
    ;

})(window, window.angular, window.ones, window.io);