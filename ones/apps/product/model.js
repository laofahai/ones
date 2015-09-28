(function(window, angular, ones, io) {
    'use strict';

    angular.module('ones.app.product.model', [])
        .service("Product.ProductAPI", [
            'ones.dataApiFactory',
            'RootFrameService',
            function(dataAPI, RootFrameService) {

                var self = this;

                this.unicode = function(item) {
                    return item.serial_number + ' ' + item.name;
                };

                this.config = {
                    app: 'product',
                    module: 'product',
                    table: 'product',
                    fields: {
                        serial_number: {
                            ensureUnique: 'Product.ProductAPI',
                            search_able: true
                        },
                        name: {
                            search_able: 1,
                            get_display: function(value, item) {
                                return self.unicode(item);
                            }
                            //search_able_fields: 'name,pinyin'
                        },
                        product_category: {
                            label: _("Product Category"),
                            map: "product_category_id",
                            widget: 'select',
                            data_source: "Product.ProductCategoryAPI"
                        },
                        company: {
                            addable: false,
                            editable: false
                        },
                        cost: {
                            get_display: function(value) {
                                return accounting.format(value, ones.system_preference.decimal_scale);
                            }
                        },
                        price: {
                            get_display: function(value) {
                                return accounting.format(value, ones.system_preference.decimal_scale);
                            }
                        }
                    },
                    list_display: ['name', 'product_category', 'cost', 'price'],
                    sortable: ['id', 'product_category'],
                    filters: {
                        product_category: {
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
            'Home.SchemaAPI',
            function(dataAPI, schemaAPI) {
                var self = this;

                this.config = {
                    app: 'product',
                    module: 'product_category',
                    table: 'product_category',
                    label_field: "name",
                    value_field: "id",

                    fields: {
                        name: {

                        },
                        company: {
                            addable: false,
                            editable: false
                        }
                    },

                    list_display: ['name'],
                    columns: 1
                };


                this.resource = dataAPI.getResourceInstance({
                    uri: 'product/productCategory',
                    extra_methods: ['api_query', 'update', 'api_get']
                });

            }
        ])
    ;

})(window, window.angular, window.ones, window.io);