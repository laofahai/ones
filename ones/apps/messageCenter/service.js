(function(window, angular, ones, io) {
    'use strict';

    /*
    * 消息中心客户端
    * 在/ones/common/config.js 中配置 ones.mc_socket选项，或在系统首选项中配置
    * */
    ones.global_module
        .factory('ones.MessageCenter', [
            'socketFactory',
            'pluginExecutor',
            function(socketFactory, plugin) {
                if(!is_app_loaded('messageCenter') || undefined === io || !ones.user_info) {
                    ones.caches.setItem('socket.connected', false);
                    ones.DEBUG && console.debug('Connect to message center failed.');
                    return {
                        on: function() {},
                        emit: function() {}
                    };
                }

                var connection = io.connect(ones.system_preference.mc_socket_pass || ones.mc_socket, {
                    reconnection: false
                });
                var ins = socketFactory(
                    {
                        ioSocket: connection
                    }
                );

                ones.caches.setItem('socket.connected', true);
                ones.DEBUG && console.debug('Message center connected');

                // room_id 为颗粒度，默认为仅当前用户
                ins.emit('client_ready', {
                    room_id: ones.user_info.id
                });

                if(window.location.href.indexOf(ones.APP_ENTRY) >= 0) {
                    plugin.callPlugin('global_socket_on_event', ins);
                }

                return ins;
            }
        ])
    ;

})(window, window.angular, window.ones, window.io);