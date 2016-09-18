(function(window, ones, angular) {
    // REST请求调试信息
    window.top.__DEBUG_REMOTE_INFO = window.top.__DEBUG_REMOTE_INFO || {};
    window.top.__DEBUG_REMOTE_URIS = window.top.__DEBUG_REMOTE_URIS || [];
    window.top.__DEBUG_INDEX = window.top.__DEBUG_INDEX || 0;
    window.top.__DEBUGGER_ENABLE_FOR = window.top.__DEBUGGER_ENABLE_FOR || [1];

    window.set_debugger_info = function(uri, info) {
        if(!ones.DEBUG || !uri || !info) {
            return;
        }

        uri = uri.replace('/ones/server/gateway.php?s=', '');
        uri = uri.replace('../server/gateway.php?s=', '');
        uri = uri.replace(/&amp;/ig, '&');
        uri = '['+window.top.__DEBUG_INDEX + '] ' + uri;

        window.top.__DEBUG_REMOTE_URIS.push(uri);
        window.top.__DEBUG_REMOTE_INFO[uri] = info;
        window.top.__DEBUG_INDEX++;
    };

    angular.module('ones.debuggerModule', [])
        .controller('ONES_DEBUGGER_CONTROLLER', [
            '$scope',
            '$timeout',
            function($scope, $timeout) {
                $scope.debug_uris = window.top.__DEBUG_REMOTE_URIS;
                $scope.debug_info = window.top.__DEBUG_REMOTE_INFO;

                $scope.active_index = 0;
                $scope.current_info_option = 'DEBUG';
                $scope.current_info = {};
                $scope.show_debugger = false;
                $scope.debugger_enable = false;

                if(ones.DEBUG && ones.company_profile && window.top.__DEBUGGER_ENABLE_FOR.indexOf(parseInt(ones.company_profile.id)) >= 0) {
                    $scope.debugger_enable = true;
                } else {
                    return false;
                }

                $scope.info_options = [
                    {label: 'EMERG', key: 'EMERG'},
                    {label: 'ALERT', key: 'ALERT'},
                    {label: 'CRIT', key: 'CRIT'},
                    {label: 'WARN', key: 'WARN'},
                    {label: 'ERR', key: 'ERR'},
                    {label: 'INFO', key: 'INFO'},
                    {label: 'NOTICE', key: 'NOTIC'},
                    {label: 'SQL', key: 'SQL'},
                    {label: 'DEBUG', key: 'DEBUG'}
                ];

                //$scope.$watch(function() {
                //    return $scope.debug_uris;
                //}, function(value) {
                //    $timeout(function() {
                //        $('.__debug_nav a.active').trigger('click');
                //    }, 1000);
                //});

                $scope.switch_info = function(index) {
                    var uri = $scope.debug_uris[index];
                    $scope.active_index = index;
                    if(!$scope.debug_info || !$scope.debug_info[uri]) {
                        return;
                    }
                    $scope.debug_info[uri].REQUEST_URI = $scope.debug_info[uri].REQUEST_URI.replace(/&amp;/g, '&');
                    $scope.current_info = $scope.debug_info[uri];
                };

                $scope.switch_info_option = function(option, not_clicked) {
                    if(!not_clicked) {
                        $scope.show_debugger = true;
                    }
                    $scope.current_info_option = option;
                };

                $scope.switch_info(0);
            }
        ]);
    
})(window, window.ones, window.angular);