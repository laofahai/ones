(function(window, ones, angular) {
    'use strict';

    ones.pluginRegister('global_socket_on_event', function(injector, defered, mc) {
        mc.on('desktop_notify', function(data) {
            window._desktop_notify(data);
        });
    });

    // 桌面提醒
    window.Notification && Notification.requestPermission();

    window._desktop_notify = function(params) {
        var notification = new Notification(params.subject || _('notification.ONES Notification'), {
            body: params.content,
            icon: params.icon || 'images/logo_mini_blue.png',
            tag: params.alias || randomString(6)
        });

        // 自动关闭
        if(false !== params.auto_close) {
            var duration = parseInt(params.auto_close) > 0 ? auto_close : 5000;
            notification.onshow = function () {
                setTimeout(function () {
                    notification.close();
                }, duration);
            }
        }

        // 点击事件
        if(typeof params.onclick === 'function') {
            notification.onclick = function() {
                params.onclick();
            };
        }
    };

    ones.global_module
        /*
         * angular程序中使用通知接口
         *
         * 插件钩子： notification.method, params: [notify_types, notify_methods]
         * */
        .service('ones.notification', [
            'pluginExecutor',
            'ones.MessageCenter',
            function(plugin, mc) {

                var self = this;

                this.notify_types = ['desktop'];

                // 具体通知方法
                this.notify_methods = {
                    /*
                     * 桌面提醒方法，接口参数为对象 = {
                     *   subject: 提醒标题
                     *   content: 提醒内容 「必须」
                     *   icon: 图标 桌面提醒专用
                     *   alias: 提醒标识
                     *   to_users: 接受提醒UID数组
                     *   auto_close: 是否自动关闭 桌面提醒等专用
                     * }
                     * */
                    desktop: function(params) {
                        angular.extend(params, {
                            sign_id: ones.caches.getItem('company_sign_id'),
                            user_info_id: params.to_users || [ones.user_info.id]
                        });
                        window._desktop_notify(params);
                    }
                };

                plugin.callPlugin('notification.method', this.notify_types, this.notify_methods);

                /*
                * 接口方法
                * @param type 通知类型，可为数组
                * @param to_users 通知至用户ID 可为数组
                * @param params 通知参数对象
                * */
                this.notify = function(type, to_users, params) {

                    if(!to_users) {
                        return;
                    }

                    params = angular.isObject(params) ? params : {content: params};
                    type = angular.isArray(type) ? type : [type];
                    params.to_users = angular.isArray(to_users) ? to_users: [to_users];

                    angular.forEach(type, function(t) {
                        var method = 'by_' + t;
                        if(typeof self.notify_methods[method] === 'function') {
                            self.notify_methods[method](params);
                        }
                    });
                };
            }
        ])
    ;

})(window, window.ones, window.angular);