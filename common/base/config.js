(function() {
    'use strict';
    /**
     * 基本配置
     * */
    var BaseConf = {
        DEBUG: true,
        BSU: "./server/gateway.php?s=/",
        Prefix: "ones",
        LoadedApps: ['[ones.loadedApps.placeholder]']
    };
    angular.module("ones.configModule", [])
        .factory("ones.config", ["$location", function($location) {

            ones.loadedApps = BaseConf.LoadedApps;
            try{
                var localValue = angular.fromJson(localStorage.getItem("ones.config"));
                if (localValue) {
                    return localValue;
                }
            } catch(err) {
                return BaseConf;
            }
            return BaseConf;
        }])
        .run(["$rootScope", "$http", "$injector", "$location", function($rootScope, $http, $injector, $location) {

            var loginHash = uriParamsGet('hash');
            if ($location.url() && !loginHash && !ones.installing) {
                window.location.href = 'index.html';
            }

            $http.defaults.headers.common["sessionHash"] = loginHash;
//                $http.defaults.headers.post = {
//                    'Content-Type': 'application/x-www-form-urlencoded'
//                };
            $http.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8';
            $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
//                $http.defaults.transformRequest = function (data) {
//                    return angular.isObject(data) && String(data) !== '[object File]' ? jQuery.param(data) : data;
//                };

            try {
                var configRes = $injector.get("ConfigRes");
                /**
                 * 加载配置
                 * */
                configRes.query({
                    queryAll: true
                }).$promise.then(function(data) {
                    angular.forEach(data, function(item) {
                        BaseConf[item.alias] = item.value;
                    });
                    //localStorage.setItem("ones.config", angular.toJson(BaseConf));
                });
            } catch (err) {

            }

            /**
             * 加载语言包
             * */
            $rootScope.i18n = angular.fromJson(localStorage.getItem(BaseConf.Prefix + "i18n"));
            if (BaseConf.DEBUG || !$rootScope.i18n) {
                $http.get(BaseConf.BSU+"FrontendRuntime/index/action/getI18n/lang/zh-cn").success(function(data) {
                    $rootScope.i18n = data;
                    if(!$rootScope.i18n) {
                        throw("can't load i18n package.");
                    }
                    localStorage.setItem(BaseConf.Prefix + "i18n", angular.toJson(data));
                });
            }
        }])
    ;
})();
