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
                {value: 2, label: _('common.No')}
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

        // 公司信息
        ones.pluginScope.append('common_config_item', {
            alias: 'company_name',
            label: _('home.Company Name'),
            widget: 'text',
            required: false,
            app: 'home'
        });
        ones.pluginScope.append('common_config_item', {
            alias: 'company_name_opts',
            widget: 'hidden',
            value: 'home,string',
            app: 'home'
        });
        ones.pluginScope.append('common_config_item', {
            alias: 'company_address',
            label: _('home.Company Address'),
            widget: 'text',
            required: false,
            app: 'home'
        });
        ones.pluginScope.append('common_config_item', {
            alias: 'company_address_opts',
            widget: 'hidden',
            value: 'home,string',
            app: 'home'
        });
        ones.pluginScope.append('common_config_item', {
            alias: 'company_phone',
            label: _('home.Company Phone'),
            widget: 'text',
            required: false,
            app: 'home'
        });
        ones.pluginScope.append('common_config_item', {
            alias: 'company_phone_opts',
            widget: 'hidden',
            value: 'home,string',
            app: 'home'
        });
        ones.pluginScope.append('common_config_item', {
            alias: 'company_fax',
            label: _('home.Company Fax'),
            widget: 'text',
            required: false,
            app: 'home'
        });
        ones.pluginScope.append('common_config_item', {
            alias: 'company_fax_opts',
            widget: 'hidden',
            value: 'home,string',
            app: 'home'
        });

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