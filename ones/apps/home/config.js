(function(window, angular, ones) {

    ones.global_module
        .config(['$routeProvider', function($route){
            $route
                .when('/home/config', {
                    controller: 'HomeConfigInitCtrl',
                    templateUrl: 'views/blank.html'
                })
                .when('/home/config/:app', {
                    controller: 'HomeConfigEditCtrl',
                    templateUrl: appView('system_preference.html')
                })
            ;
        }])
        .service('Home.ConfigAPI', [
            'ones.dataApiFactory',
            'pluginExecutor',
            '$q',
            function(dataAPI, plugin, $q) {
                this.resource = dataAPI.getResourceInstance({
                    uri: 'home/config',
                    extra_methods: ['api_get', 'api_query']
                });

                this.config = {
                    app: 'home',
                    module: 'config',
                    table: 'config',
                    columns: 1,
                    fields: {},
                    unaddable: ['val', 'alias', 'data_type', 'app'],
                    uneditable: ['val', 'alias', 'data_type', 'app']
                };

                var self = this;

                /*
                * 获取应用配置
                * */
                this.get_app_config = function(app) {

                    var defered = $q.defer();

                    var cache_key = 'ones.config.app.'+app;
                    var cached = ones.caches.getItem(cache_key);

                    if(!ones.DEBUG && cached) {
                        defered.resolve(cached);
                        return defered;
                    }

                    var res = dataAPI.getResourceInstance({
                        uri: 'home/config/app',
                        extra_methods: ['api_get']
                    });
                    res.api_get({
                        app_name: app
                    }).$promise.then(function(data) {
                            ones.caches.setItem(cache_key, data);
                            defered.resolve(data);
                        });

                    return defered;
                };

                /*
                * 获取公司配置
                * */
                this.get_company_config = function(key) {
                    if(key) {
                        return ones.system_preference[key];
                    }
                    return ones.system_preference;
                };

            }
        ])
        .controller('HomeConfigEditCtrl', [
            '$scope',
            'Home.ConfigAPI',
            'pluginExecutor',
            '$routeParams',
            '$location',
            function($scope, model, plugin, $routeParams, $location){

                plugin.callPlugin('common_config_item');
                var config_items = ones.pluginScope.get('common_config_item');
                $scope.apps = [];

                model.config.fields = {};

                // 获得可配置应用列表
                angular.forEach(config_items, function(item, k) {
                    if($scope.apps.indexOf(item.app) < 0) {
                        $scope.apps.push(item.app);
                    }

                    // 当前配置应用
                    if($routeParams.app === item.app) {
                        model.config.fields[item.alias] = item;
                    }
                });

                $scope.panel_title = _('home.Edit %s Preference', to_app_name($routeParams.app));
                $scope.current_app = $routeParams.app;

                $scope.filter_by_app = function(app) {
                    $location.url('/home/config/' + app);
                };

                $scope.formConfig = {
                    resource: model.resource,
                    model   : model,
                    id      : 1
                };
            }
        ])
        .controller('HomeConfigInitCtrl', [
            '$location',
            'pluginExecutor',
            function($location, plugin) {
                plugin.callPlugin('common_config_item');
                var config_items = ones.pluginScope.get('common_config_item');

                try {
                    var app = config_items[1].value.split(',')[0];
                    $location.url('/home/config/' + app);
                } catch(e) {}
            }
        ])
    ;
})(window, window.angular, window.ones);