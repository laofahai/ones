(function(window, angular, ones){
    'use strict';

    // 商机状态
    ones.pluginRegister('common_type_module', function(injector, defered) {
        ones.pluginScope.append('common_type_module', {
            label: _('marketing.Sale Opportunities Status'),
            value: 'sale_opportunities_status'
        });
    });

    // 合同自定义字段
    ones.pluginRegister('data_model_supported', function() {
        ones.pluginScope.append('data_model_supported', {
            label: _('marketing.Contract') + ' ' + _('common.Module'),
            value: 'marketing.contract'
        });
    });

})(window, window.angular, window.ones);