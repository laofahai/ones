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
                    {value: 0, label: _('purchase.ORDERS_STATUS_NEW')},
                    {value: 1, label: _('purchase.ORDERS_STATUS_SAVED')},
                    {value: 2, label: _('purchase.ORDERS_STATUS_COMPLETE')}
                ]
            },
            {
                field: 'remark'
            }
        ];
        ones.pluginScope.set('bpm_editable_fields', fields);
    });
})(window, window.angular, window.ones);