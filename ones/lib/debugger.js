(function(window, ones, angular) {
    // REST请求调试信息
    window.top.__DEBUG_REMOTE_INFO = window.top.__DEBUG_REMOTE_INFO || {};
    window.top.__DEBUG_REMOTE_URIS = window.top.__DEBUG_REMOTE_URIS || [];

    window.set_debugger_info = function(uri, info) {
        if(!ones.DEBUG || !uri || !info) {
            return;
        }

        uri = uri.replace('/ones/server/gateway.php?s=', '');
        uri = uri.replace('../server/gateway.php?s=', '');
        uri = uri.replace(/&amp;/ig, '&');

        if(window.top.__DEBUG_REMOTE_URIS.indexOf(uri) >= 0) {
            window.top.__DEBUG_REMOTE_URIS.remove(uri);
        }
        window.top.__DEBUG_REMOTE_URIS.push(uri);
        window.top.__DEBUG_REMOTE_INFO[uri] = info;
    };
    //
    //if(!ones.DEBUG) {
    //    angular.module('ones.debuggerModule', [])
    //        .controller('ONES_DEBUGGER_CONTROLLER', [function() {}]);
    //    return;
    //}

    angular.module('ones.debuggerModule', [])
        .controller('ONES_DEBUGGER_CONTROLLER', [
            '$scope',
            function($scope) {
                $scope.debug_uris = window.top.__DEBUG_REMOTE_URIS;
                $scope.debug_info = window.top.__DEBUG_REMOTE_INFO;

                $scope.active_index = 0;
                $scope.current_info_option = 'INFO';
                $scope.current_info = {};
                $scope.show_debugger = false;

                $scope.info_options = [
                    {label: 'INFO', key: 'INFO'},
                    {label: 'NOTICE', key: 'NOTIC'},
                    {label: 'SQL', key: 'SQL'}
                ];

                $scope.switch_info = function(index) {
                    var uri = $scope.debug_uris[index];
                    $scope.active_index = index;
                    $scope.current_info = $scope.debug_info[uri];
                };

                $scope.switch_info_option = function(option) {
                    $scope.current_info_option = option;
                };

                $scope.switch_info(0);
            }
        ]);
    
})(window, window.ones, window.angular);