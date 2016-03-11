(function(window, angular, ones, io) {
    'use strict';

    angular.module('ones.app.product.model', [])
        .service("Product.ProductAPI", [
            'ones.dataApiFactory',
            'RootFrameService',
            function(dataAPI, RootFrameService) {

                var self = this;

                this.unicode = function(item) {
                    return item.name;
                    //return item.serial_number + ' ' + item.name;
                };

                this.config = {
                    app: 'product',
                    module: 'product',
                    table: 'product',
                    fields: {
                        serial_number: {
                            ensureUnique: 'Product.ProductAPI',
                            search_able: true,
                            grid_fixed: true
                        },
                        name: {
                            search_able: 1,
                            grid_fixed: true
                            //search_able_fields: 'name,pinyin'
                        },
                        product_category_id: {
                            label: _("product.Product Category"),
                            widget: 'select',
                            data_source: "Product.ProductCategoryAPI"
                        },
                        cost: {
                            get_display: function(value) {
                                return accounting.format(value, ones.system_preference.decimal_scale);
                            }
                        },
                        price: {
                            get_display: function(value) {
                                return accounting.format(value, ones.system_preference.decimal_scale);
                            },
                            grid_fixed: true
                        },
                        bar_code: {
                            search_able: true
                        }
                    },
                    sortable: ['id'],
                    filters: {
                        product_category_id: {
                            type: 'link'
                        }
                    },
                    extra_selected_actions: []
                };

                /*
                * 产品属性模块
                * */
                if(is_app_loaded('productAttribute')) {
                    var add_label = _('common.Add New') + _('productAttribute.Product Attribute Content');
                    this.config.extra_selected_actions.push({
                        label: add_label,
                        auth_node: 'productAttribute.productAttributeContent.post',
                        icon: 'plus',
                        action: function(evt, selected, item) {
                            item = item || selected[0];
                            if(!item) {
                                return false;
                            }

                            RootFrameService.open_frame({
                                label: add_label,
                                src: 'productAttribute/productAttributeContent/add/product_id/'+item.id,
                                singleton: true
                            });
                        }
                    });
                }


                this.resource = dataAPI.getResourceInstance({
                    uri: 'product/product',
                    extra_methods: ['api_query', 'update', 'api_get']
                });

            }
        ])
        .service("Product.ProductCategoryAPI", [
            'ones.dataApiFactory',
            'RootFrameService',
            function(dataAPI, RootFrameService) {
                this.config = {
                    app: 'product',
                    module: 'product_category',
                    table: 'product_category',
                    label_field: "name",
                    value_field: "id",
                    addable: false,

                    fields: {
                        name: {
                            get_display: function(value, item) {
                                return item.prefix_name;
                            }
                        },
                        lft: {
                            addable: false,
                            editable: false
                        },
                        rgt: {
                            addable: false,
                            editable: false
                        }
                    },

                    list_hide: ['lft', 'rgt'],
                    columns: 1,
                    extra_selected_actions: [
                        get_selected_action_for_add_child(RootFrameService)
                    ]
                };


                this.resource = dataAPI.getResourceInstance({
                    uri: 'product/productCategory',
                    extra_methods: ['api_query', 'update', 'api_get']
                });

            }
        ])
    ;

})(window, window.angular, window.ones, window.io);