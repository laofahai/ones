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
        ones.pluginScope.append('common_type_module', {
            label: _('finance.Payment Method'),
            value: 'finance_payment_method'
        });
    });

})(window, window.angular, window.ones);