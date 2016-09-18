(function(window, angular, ones){
    angular.module('ones.app.home.main', [
        'ones.frameInnerModule',
        'ones.gridViewModule',
        'ones.detailViewModule'
    ])
        .config([
            "$routeProvider",
            function($routeProvider) {
                $routeProvider
                    .when("/home/clearCache", {
                        controller  : "Home.ClearCacheCtrl",
                        templateUrl : appView("clear_cache.html")
                    })
                ;
            }
        ])

        .controller("Home.ClearCacheCtrl", [
            '$scope',
            'Home.ConfigAPI',
            'RootFrameService',
            function($scope, config_api, RootFrameService) {
                $scope.clear_cache_info = {
                    frontend: false,
                    backend: false
                };

                var do_clear = function() {
                    if($scope.clear_cache_info.frontend) {
                        ones.caches.clear();
                        RootFrameService.alert({
                            type: 'info',
                            content: _('home.Cache has been cleared, please re-login')
                        });
                    }
                };

                $scope.do_submit = function() {
                    if($scope.clear_cache_info.backend) {
                        var params = {
                            _m: 'clear_cache'
                        };
                        config_api.resource.save(params, {}).$promise.then(function() {
                            do_clear();
                        });
                    } else {
                        do_clear();
                    }
                };
            }
        ])
    ;
})(window, window.angular, window.ones);