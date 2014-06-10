'use strict';
(function() {
    /**
     * 基本配置
     * */
    window.BSU = "../erp_server/gateway.php?s=/";
    var ERPBaseConf = {
        //Base Server Uri 所有与服务器交互绝对路径开始

        DEBUG: true,
        Prefix: "ones"
    };

    angular.module("ones.configModule", [])
            .factory("ones.config", [function() {
                    var localValue = angular.fromJson(localStorage.getItem("ones.config"));
                    if (!ERPBaseConf.DEBUG && localValue) {
                        return localValue;
                    }

                    ERPBaseConf.BSU = window.BSU;
                    return ERPBaseConf;
                }])
            .run(["$rootScope", "$http", "$injector", function($rootScope, $http, $injector) {

                    try {
                        var configRes = $injector.get("ConfigRes");
                        /**
                         * 加载配置
                         * */
                        configRes.query({
                            queryAll: true
                        }).$promise.then(function(data) {
                            angular.forEach(data, function(item) {
                                ERPBaseConf[item.alias] = item.value
                            });

                            localStorage.setItem("ones.config", angular.toJson(ERPBaseConf));
                        });
                    } catch (err) {

                    }



                    /**
                     * 加载语言包
                     * */
                    $rootScope.i18n = angular.fromJson(localStorage.getItem(ERPBaseConf.Prefix + "i18n"));
                    if (ERPBaseConf.DEBUG || !$rootScope.i18n) {
                        $http.get("scripts/i18n/zh-cn.json").success(function(data) {
                            $rootScope.i18n = data;
                            localStorage.setItem(ERPBaseConf.Prefix + "i18n", angular.toJson(data));
                        });
                    }



                }])
            ;
})();
