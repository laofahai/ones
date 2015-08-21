(function(window, angular, ones) {
    // 注册公司基本信息到可支持自定义字段
    ones.pluginRegister('data_model_supported', function(injector, defered) {
        ones.pluginScope.append('data_model_supported', {
            label: _('contactsCompany.Contacts Company') + ' ' + _('common.Module'),
            value: 'contactsCompany.contactsCompany'
        });
    });


    // 联系人信息扩展字段
    ones.pluginRegister('data_model_supported', function(injector, defered) {
        ones.pluginScope.append('data_model_supported', {
            label: _('contactsCompany.Contacts Company Linkman') + ' ' + _('common.Module'),
            value: 'contactsCompany.contactsCompanyLinkman'
        });
    });

})(window,window.angular,window.ones);