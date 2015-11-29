(function(window, angular, ones) {

    // 支持通用类型
    ones.pluginRegister('common_type_module', function(injector, defered) {
        ones.pluginScope.append('common_type_module', {
            label: _('finance.Receivables Type'),
            value: 'finance_receivables_type'
        });
        ones.pluginScope.append('common_type_module', {
            label: _('finance.Payables Type'),
            value: 'finance_payables_type'
        });
    });

    // 注册至工作流服务API
    ones.pluginRegister('bpm_service_api', function(injector, defered) {
        ones.pluginScope.append('bpm_service_api', {
            label: _('finance.Confirm Receivables'),
            value: _('finance.receivables.confirm'),
            module: 'finance.receivables'
        });

        // 检测是否已完全收款
        ones.pluginScope.append('bpm_service_api', {
            label: _('finance.Check full received'),
            value: _('finance.receivables.check_full_received'),
            module: 'finance.receivables'
        });

    });

    // 注册至支持工作流中修改的字段
    ones.pluginRegister('bpm_editable_fields_finance.receivables', function() {
        var fields = [
            {
                widget: 'select',
                field: 'status',
                data_source: [
                    {value: -1, label: _('common.No Data')},
                    {value: 0, label: _('finance.RECEIVABLES_STATUS_NEW')},
                    {value: 1, label: _('finance.RECEIVABLES_STATUS_PART')},
                    {value: 2, label: _('finance.RECEIVABLES_STATUS_COMPLETE')}
                ]
            }
        ];
        ones.pluginScope.set('bpm_editable_fields', fields);
    });

})(window, window.angular, window.ones);