(function(window, angular, ones){
    'use strict';

    // 个人首选项
    ones.pluginRegister('user_preference_item', function() {
        ones.pluginScope.append('user_preference_item', {
            alias: 'human_date_display',
            label: _('home.Display date hommization'),
            widget: 'select',
            data_source: [
                {value: 1, label: _('common.Yes')},
                {value: 0, label: _('common.No')}
            ],
            value: 1
        });
        ones.pluginScope.append('user_preference_item', {
            alias: 'human_date_display_opts',
            widget: 'hidden',
            value: 'home,integer'
        });

    });

    // 公司首选项
    ones.pluginRegister('common_config_item', function(injector, defered, fields) {


        // decimal 保留小数位
        ones.pluginScope.append('common_config_item', {
            alias: 'decimal_scale',
            label: _('home.Decimal Scale'),
            widget: 'number',
            value: 4,
            max: 4,
            min: 0,
            app: 'home'
        });
        ones.pluginScope.append('common_config_item', {
            alias: 'decimal_scale_opts',
            widget: 'hidden',
            value: 'home,integer',
            app: 'home'
        });
    });


})(window, window.angular, window.ones);