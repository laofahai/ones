(function(window, angular, ones, io){

    ones.pluginRegister('common_config_item', function(injector, defered, fields) {

        // SMTP配置
        ones.pluginScope.append('common_config_item', {
            alias: 'smtp_host',
            label: _('smtp.SMTP Host'),
            app: 'smtp'
        });
        ones.pluginScope.append('common_config_item', {
            alias: 'smtp_host_opts',
            widget: 'hidden',
            value: 'smtp,string',
            app: 'smtp'
        });

        ones.pluginScope.append('common_config_item', {
            alias: 'smtp_port',
            label: _('smtp.SMTP Host'),
            value: 25,
            app: 'smtp'
        });
        ones.pluginScope.append('common_config_item', {
            alias: 'smtp_port_opts',
            widget: 'hidden',
            value: 'smtp,integer',
            app: 'smtp'
        });

        ones.pluginScope.append('common_config_item', {
            alias: 'smtp_user',
            label: _('smtp.SMTP User'),
            app: 'smtp'
        });
        ones.pluginScope.append('common_config_item', {
            alias: 'smtp_uesr_opts',
            widget: 'hidden',
            value: 'smtp,string',
            app: 'smtp'
        });

        ones.pluginScope.append('common_config_item', {
            alias: 'smtp_password',
            label: _('smtp.SMTP Password'),
            app: 'smtp'
        });
        ones.pluginScope.append('common_config_item', {
            alias: 'smtp_password_opts',
            widget: 'hidden',
            value: 'smtp,string',
            app: 'smtp'
        });
    });

    /*
     * @app smtp
     * @author laofahai@TEam Swift
     * @link https://ng-erp.com
     * */
    'use strict';
    angular.module('ones.app.smtp.main', [

    ]);

})(window, window.angular, window.ones, window.io);