(function(window, angular, ones) {

    'use strict';
    // 客户来源类型
    ones.pluginRegister('common_type_module', function(injector, defered) {
        ones.pluginScope.append('common_type_module', {
            label: _('crm.Source From Type'),
            value: 'source_from_type'
        });
    });

    // 客户关怀类型
    ones.pluginRegister('common_type_module', function(injector, defered) {
        ones.pluginScope.append('common_type_module', {
            label: _('crm.Customer Care Type'),
            value: 'customer_care_type'
        });
    });

    // 注册线索到可支持自定义字段
    ones.pluginRegister('data_model_supported', function(injector, defered) {
        ones.pluginScope.append('data_model_supported', {
            label: _('crm.Crm Clue') + ' ' + _('common.Module'),
            value: 'crm.crmClue'
        });
    });


    // 注册至配置字段
    ones.pluginRegister('common_config_item', function(injector, defered, fields) {

        // 默认客户管理使用的往来单位角色
        ones.pluginScope.append('common_config_item', {
            alias: 'crm_customer_role',
            label: _('crm.Customer Role'),
            widget: 'select',
            data_source: 'ContactsCompany.ContactsCompanyRoleAPI',
            app: 'crm'
        });
        ones.pluginScope.append('common_config_item', {
            alias: 'crm_customer_role_opts',
            widget: 'hidden',
            value: 'crm,integer',
            app: 'crm'
        });

        // 线索池自动回收时间
        ones.pluginScope.append('common_config_item', {
            alias: 'crm_clue_gc_time',
            label: _('crm.Clue GC Time'),
            widget: 'number',
            value: 90,
            help_text: _('crm.Clue GC Time Help Text'),
            app: 'crm'
        });

        ones.pluginScope.append('common_config_item', {
            alias: 'crm_clue_gc_time_opts',
            widget: 'hidden',
            value: 'crm,integer',
            app: 'crm'
        });

        // 客户池自动回收时间
        ones.pluginScope.append('common_config_item', {
            alias: 'crm_customer_gc_time',
            label: _('crm.Customer GC Time'),
            widget: 'number',
            value: 90,
            help_text: _('crm.Customer GC Time Help Text'),
            app: 'crm'
        });

        ones.pluginScope.append('common_config_item', {
            alias: 'crm_customer_gc_time_opts',
            widget: 'hidden',
            value: 'crm,integer',
            app: 'crm'
        });
    });

})(window, window.angular, window.ones);