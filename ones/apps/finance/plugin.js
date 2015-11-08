(function(window, angular, ones) {
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
        // 转化为出库单
        ones.pluginScope.append('bpm_service_api', {
            label: _('finance.Confirm Receivables'),
            value: _('finance.receivables.confirm'),
            module: 'finance.receivables'
        });
    });

})(window, window.angular, window.ones);