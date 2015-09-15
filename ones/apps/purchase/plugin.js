(function(window, angular, ones){
    'use strict';
    // 注册至支持工作流中修改的字段
    ones.pluginRegister('bpm_editable_fields_purchase.purchase', function() {
        var fields = [
            {
                widget: 'select',
                field: 'status',
                data_source: [
                    {value: -1, label: _('common.No Data')},
                    {value: 0, label: _('purchase.PURCHASE_STATUS_NEW')},
                    {value: 1, label: _('purchase.PURCHASE_STATUS_SAVED')},
                    {value: 2, label: _('purchase.PURCHASE_STATUS_COMPLETE')}
                ]
            },
            {
                field: 'remark'
            }
        ];
        ones.pluginScope.set('bpm_editable_fields', fields);
    });
    // 注册至工作流服务API
    ones.pluginRegister('bpm_service_api', function(injector, defered) {
        // 转化为入库单
        ones.pluginScope.append('bpm_service_api', {
            label: _('storage.Convert to stock in'),
            value: _('purchase.purchase.convert_to_stock_in'),
            module: 'purchase.purchase'
        });
    });

    // 注册至配置字段
    ones.pluginRegister('common_config_item', function(injector, defered, fields) {
        if(is_app_loaded('storage')) {
            // 采购入库工作流
            ones.pluginScope.append('common_config_item', {
                alias: 'purchase_stock_in_workflow',
                label: _('sale.Purchase stock in workflow'),
                widget: 'select',
                data_source: 'Bpm.WorkflowAPI',
                data_source_query_param: {
                    _mf: 'module',
                    _mv: 'storage.stockIn'
                },
                app: 'storage'
            });
            ones.pluginScope.append('common_config_item', {
                alias: 'purchase_stock_in_workflow_opts',
                widget: 'hidden',
                value: 'sale,integer',
                app: 'storage'
            });
        }
    });


})(window, window.angular, window.ones);