(function(window, angular, ones, io){
    /*
     * @app productAttribute
     * @author laofahai@TEam Swift
     * @link http://ng-erp.com
     * */
    'use strict';
    ones.global_module

        .service('ProductAttribute.ProductAttributeAPI', [
            'ones.dataApiFactory',
            'ones.form_fields_factory',
            function(dataAPI, form_fields) {
                var self = this;

                this.resource = dataAPI.getResourceInstance({
                    uri: 'productAttribute/productAttribute',
                    extra_methods: ['api_get', 'api_query']
                });

                this.config = {
                    app: 'productAttribute',
                    module: 'productAttribute',
                    table: 'product_attribute',
                    fields: {
                        widget: {
                            widget: 'select',
                            data_source: [],
                            value: 'text',
                            get_display: function(value) {
                                return get_data_source_display(this.data_source, value);
                            }
                        },
                        data_type: {
                            widget: 'select',
                            data_source: DATA_TYPES_DATASOURCE,
                            value: 'string',
                            get_display: function(value) {
                                return get_data_source_display(this.data_source, value);
                            }
                        }
                    },
                    filters: {
                        widget: {
                            type: "link"
                        }
                    },
                    extra_selected_actions: [
                        {
                            label: _('productAttribute.View Product Attribute'),
                            icon: 'eye',
                            auth_node: "productAttribute.productAttributeContent.get",
                            action: function(evt, selected, item) {

                            }
                        }
                    ]
                };

                // 支持的输入控件
                angular.forEach(form_fields.widgets, function(widget) {
                    self.config.fields.widget.data_source.push({
                        value: widget,
                        label: _(widget+'.WIDGETS.'+camelCaseSpace(widget)+' Widget')
                    });
                });

                this.get_attributes = function() {
                    return this.resource.api_query().$promise;
                };

                /*
                * 将产品属性字段赋予模型字段配置
                * @param object model 模型对象实例
                * */
                this.assign_attributes = function(model, callback) {
                    this.get_attributes().then(function(attrs) {

                        model.config.bill_fields = model.config.bill_fields || [];
                        model.config.list_display = model.config.list_display || [];

                        angular.forEach(attrs, function(attr) {
                            if(!attr.alias || model.config.bill_fields.indexOf(attr.alias) >= 0) {
                                return false;
                            }
                            model.config.fields[attr.alias] = {
                                auto_query: true,
                                label: attr.name,
                                widget: attr.widget,
                                editable_required: 'product_id',
                                data_source: 'ProductAttribute.ProductAttributeContentAPI',
                                field: attr.alias,
                                field_model: attr.alias,
                                field_label_model: attr.alias + '__label__',
                                'ng-model': 'bill_rows[$parent.$index].' + attr.alias,
                                data_source_query_param: {
                                    _mf: 'product_attribute_id',
                                    _mv: attr.id
                                },
                                dynamic_add_opts: {
                                    addable: true
                                },
                                data_source_query_with: 'product_id' // 根据product_id查询
                            };

                            model.config.bill_fields.splice(
                                model.config.bill_fields.indexOf('product_id') + 1,
                                0,
                                attr.alias
                            );
                            model.config.list_display.splice(
                                model.config.list_display.indexOf('product_id') + 1,
                                0,
                                attr.alias
                            );
                        });

                        if(typeof callback === 'function') {
                            callback();
                        }
                    });
                };

            }
        ])

        .service('ProductAttribute.ProductAttributeContentAPI', [
            'ones.dataApiFactory',
            function(dataAPI) {
                var self = this;

                this.resource = dataAPI.getResourceInstance({
                    uri: 'productAttribute/productAttributeContent',
                    extra_methods: ['api_get', 'api_query']
                });

                this.config = {
                    app: 'productAttribute',
                    module: 'productAttributeContent',
                    table: 'product_attribute_content',
                    label_field: 'content',
                    fields: {
                        product_attribute_id: {
                            widget: 'select',
                            label: _('productAttribute.Product Attribute'),
                            data_source: 'ProductAttribute.ProductAttributeAPI',
                            get_display: function(value, item) {
                                return item.product_attribute_name;
                            }
                        },
                        product_id: {
                            widget: "select3",
                            data_source: "Product.ProductAPI",
                            group_tpl: FORM_FIELDS_TPL.select3_group_tpl,
                            label: _('product.Product')
                        },
                        product_name: {
                            label: _('product.Product'),
                            addable: false,
                            editable: false,
                            search_able: true
                        }
                    },
                    filters: {
                        product_attribute_id: {
                            type: "link"
                        }
                    },
                    addable: false
                };

            }
        ])

    ;

})(window, window.angular, window.ones, window.io);