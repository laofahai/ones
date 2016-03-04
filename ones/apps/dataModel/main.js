(function(window, angular, ones){

    /**
     * 数据模型
     * 支持对任意数据字段的任意扩展
     * @plugin data_model_supported
     * */
    angular.module('ones.app.dataModel.main', [
        'ones.frameInnerModule',
        'ones.gridViewModule'
    ])
        .service('DataModel.DataModelFieldAPI', [
            'ones.dataApiFactory',
            'ones.form_fields_factory',
            'pluginExecutor',
            function(dataAPI, form_fields, plugin) {

                var self = this;

                this.config = {
                    app: 'dataModel',
                    module: 'dataModelField',
                    table: 'data_model_field',

                    columns: 1,
                    fields: {
                        alias: {
                            help_text: _('dataModel.help_text_alias'),
                            ensureUnique: 'DataModel.DataModelFieldAPI'
                        },
                        belongs_to_module: {
                            widget: "select",
                            get_display: function(value) {
                                return get_data_source_display(this.data_source, value);
                            }
                        },
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
                        },
                        search_able: {
                            widget: 'radio',
                            inline: true,
                            data_source: [
                                {value: "0", label: _('common.Can\'t be search')},
                                {value: "1", label: _('common.Fuzzy search')},
                                {value: "2", label: _('common.Precision match')}
                            ],
                            value: "0",
                            cell_filter: 'toDataModelFieldSearchAble',
                            get_display: function(value) {
                                return get_data_source_display(this.data_source, value);
                            },
                            help_text: _('dataModel.help_text_search_able'),
                            editable: false
                        },
                        config: {
                            label: _('dataModel.Extra Config'),
                            style: 'height:200px;',
                            widget: 'textarea',
                            help_text: _('dataModel.help_text_field_extra_config')
                        }
                    },
                    filters: {
                        search_able: {
                            type: 'link'
                        },
                        belongs_to_module: {
                            type: 'link'
                        }
                    },
                    list_hide: ['alias', 'config']
                };

                // 支持自定义字段的模块
                plugin.callPlugin('data_model_supported');
                this.config.fields.belongs_to_module.data_source = ones.pluginScope.get('data_model_supported') || [];

                // 支持的输入控件
                angular.forEach(form_fields.widgets, function(widget) {
                    self.config.fields.widget.data_source.push({
                        value: widget,
                        label: _(widget+'.WIDGETS.'+camelCaseSpace(widget)+' Widget')
                    });
                });

                this.resource = dataAPI.getResourceInstance({
                    uri: 'dataModel/dataModelField',
                    extra_methods: ['api_query', 'api_get']
                });


            }
        ])
        .filter('toDataModelFieldSearchAble', [
            'DataModel.DataModelFieldAPI',
            function(dataModel) {
                return function(value, index) {
                    var data_source = dataModel.config.fields.search_able.data_source;
                    for(var i=0; i< data_source.length; i++) {
                        if(data_source[i].value === value) {
                            return data_source[i].label;
                        }
                    }

                    return value;
                }
            }]
    )
    ;
})(window, window.angular, window.ones);