(function(window, angular, ones) {
    'use strict';
    // 注册至配置字段
    ones.pluginRegister('common_config_item', function(injector, defered, fields) {

        ones.pluginScope.append('common_config_item', {
            alias: 'mc_socket_pass',
            label: _('messageCenter.Socket Pass'),
            required: false,
            help_text: _('messageCenter.Socket Pass help text'),
            app: 'messageCenter'
        });
        ones.pluginScope.append('common_config_item', {
            alias: 'mc_socket_pass_opts',
            widget: 'hidden',
            value: 'messageCenter,string',
            app: 'messageCenter'
        });
    });

    // 注册至用户头像下拉菜单
    ones.pluginRegister('main_user_dropdown_menu', function(injector, defered) {
        var html = '<li role="presentation"> '+
            '<a role="menuitem" tabindex="-1" ' +
            'href="javascript:void(0);" ng-click="addFrame(_(\'messageCenter.Notifications\'), \'messageCenter/notification\')">'+
            '<i class="fa fa-cog"></i> '+
            '<span ng-bind="\'messageCenter.Notifications\'|lang"></span>'+
            '</a>'+
            '</li>';
        return;
        ones.pluginScope.append('main_user_dropdown_menu', html);
    })
})(window, window.angular, window.ones);