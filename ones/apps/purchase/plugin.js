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
            label: _('purchase.Convert to stock in'),
            value: _('purchase.purchase.convert_to_stock_in'),
            module: 'purchase.purchase'
        });
    });
})(window, window.angular, window.ones);