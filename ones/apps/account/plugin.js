(function(window, angular, ones) {
    'use strict';

    ones.pluginRegister('user_preference_item', function() {
        ones.pluginScope.append('user_preference_item', {
            alias: 'show_username_with_department',
            label: _('account.Show username with department'),
            widget: 'select',
            data_source: [
                {value: 1, label: _('common.Yes')},
                {value: 2, label: _('common.No')}
            ],
            value: 1
        });
        ones.pluginScope.append('user_preference_item', {
            alias: 'show_username_with_department_opts',
            widget: 'hidden',
            value: 'home,integer'
        });
    });

})(window, window.angular, window.ones);