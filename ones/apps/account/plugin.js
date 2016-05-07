(function(window, angular, ones) {
    'use strict';

    ones.pluginRegister('user_preference_item', function() {
        ones.pluginScope.append('user_preference_item', {
            alias: 'show_username_with_department',
            label: _('account.Show username with department'),
            widget: 'select',
            data_source: [
                {value: 1, label: _('common.Yes')},
                {value: 0, label: _('common.No')}
            ],
            value: 1
        });
        ones.pluginScope.append('user_preference_item', {
            alias: 'show_username_with_department_opts',
            widget: 'hidden',
            value: 'home,integer'
        });
    });

    // 注册到可支持自定义字段
    ones.pluginRegister('data_model_supported', function(injector, defered) {
        ones.pluginScope.append('data_model_supported', {
            label: _('account.Company Profile') + ' ' + _('common.Module'),
            value: 'account.companyProfile'
        });
    });

})(window, window.angular, window.ones);