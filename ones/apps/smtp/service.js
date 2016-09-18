(function(window, angular, ones, io){

    // 配置项目
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
            alias: 'smtp_enable_ssl',
            label: _('smtp.SMTP Enable SSL'),
            widget: 'select',
            data_source: window.BOOLEAN_DATASOURCE,
            value: 1,
            app: 'smtp'
        });
        ones.pluginScope.append('common_config_item', {
            alias: 'smtp_enable_ssl_opts',
            widget: 'hidden',
            value: 'smtp,integer',
            app: 'smtp'
        });

        ones.pluginScope.append('common_config_item', {
            alias: 'smtp_port',
            label: _('smtp.SMTP Port'),
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
            alias: 'smtp_user_opts',
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
            alias: 'smtp_from_address',
            label: _('smtp.SMTP From Email'),
            app: 'smtp'
        });
        ones.pluginScope.append('common_config_item', {
            alias: 'smtp_from_address_opts',
            widget: 'hidden',
            value: 'smtp,string',
            app: 'smtp'
        });

        ones.pluginScope.append('common_config_item', {
            alias: 'smtp_from_name',
            label: _('smtp.SMTP From Name'),
            app: 'smtp'
        });
        ones.pluginScope.append('common_config_item', {
            alias: 'smtp_from_name_opts',
            widget: 'hidden',
            value: 'smtp,string',
            app: 'smtp'
        });

        ones.pluginScope.append('common_config_item', {
            alias: 'smtp_sign_content',
            label: _('smtp.Public Sign Content'),
            app: 'smtp',
            widget: 'textarea',
            required: false,
            style: 'height:100px'
        });
        ones.pluginScope.append('common_config_item', {
            alias: 'smtp_sign_content_opts',
            widget: 'hidden',
            value: 'smtp,string',
            app: 'smtp'
        });

    });

    // 提醒方式
    ones.pluginRegister('notification.method', function(injector, defer, types, methods) {
        types.push('email');
        methods.by_email = function(params) {

        };
    });

    /*
     * @app smtp
     * @author laofahai@TEam Swift
     * @link http://ng-erp.com
     * */
    'use strict';
    angular.module('ones.app.smtp.main', []);

    ones.global_module
        .service('ones.SMTP', [
            'ones.dataApiFactory',
            function(dataAPI) {
                this.resource = dataAPI.getResourceInstance({
                    uri: 'smtp/sendMail',
                    extra_methods: ['api_get', 'api_query']
                });

                this.config = {};

                // 发送邮件接口
                // @todo
                this.send_mail = function(params) {};
            }
        ])
    ;

})(window, window.angular, window.ones, window.io);