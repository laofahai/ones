(function() {
    'use strict';
    /**
     * 基本配置
     * */
    ones.BaseConf.BSU = "./index.php?s=/";
    ones.BaseConf.Prefix= "ones";
    ones.BaseConf.modelConfigFields = [
        "isBill",
        "workflowAlias",
        "editAble",
        "deleteAble",
        "printAble",
        "viewDetailAble",
        "subAble",
        "addSubAble",
        "viewSubAble",
        "exportAble",
        "multiSelect"
    ];

    ones.keyCodes = {
        Enter: 13,
        Tab: 9,
        Up: 38,
        Down: 40,
        Escape: 27
    };

    angular.module("ones.configModule", [])
        .service("ones.dataApiFactory", ["ones.config", "$resource", "$injector", function(config, $resource, $injector){

            this.resource = {};
            this.model = {};

            this.getResourceInstance = function(opts){
                if(undefined === opts.extraMethod) {
                    opts.extraMethod = $.extend({update: {method: "PUT"}}, opts.extraMethod);
                }

                var resUri = sprintf("%s%s/:id.json", config.BSU, opts.uri);
                return $resource(resUri, opts.opts||{}, opts.extraMethod||{});
            };

            this.init = function(group, module) {
                try {
                    //尝试使用DataAPI模式
                    this.model = $injector.get(toAPIName(group, module));
                    this.resource = this.model;
                } catch(e) {
//                    console.log(e);
                    try {
                        //尝试使用已定义的资源
                        this.resource = $injector.get(module.ucfirst()+"Res");
                    } catch(e) {
                        //尝试使用动态定义资源
                        var $resource = $injector.get("$resource");
                        this.resource = $resource(sprintf("%s%s/%s/:id.json", group, module), null, {
                            update: {method: "PUT"}
                        });
                    }

                    var modelName = module.ucfirst()+"Model";
                    try {
                        this.model = $injector.get(modelName);
                    } catch(e) {
                        throw("can't load model:"+ modelName);
                    }
                }

                return this.model;
            };

        }])
        .factory("ones.config", ["$location", function($location) {

            ones.loadedApps = ones.BaseConf.LoadedApps;

            var localValue = ones.caches.getItem("ones.config");
            if(!localValue) {
                ones.caches.setItem("ones.config", ones.BaseConf, 1);
            }

            return ones.caches.getItem("ones.config");

        }])
        .run(["$rootScope", "$http", "$injector", "$location", function($rootScope, $http, $injector, $location) {

            ones.defaultCacheLevel = ones.BaseConf.DEBUG ? 0 : 1;

            $http.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8';
            $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

            /**
             * 加载语言包
             * */
            $rootScope.i18n = ones.caches.getItem("ones.i18n");
            if(!$rootScope.i18n && !ones.installing) {
                if(!ones.caches.getItem("ones.reloading")){
                    ones.caches.setItem("ones.reloading", true, 1);
                    window.location.reload();
                    return;
                }

                try {
                    var configRes = $injector.get("HOME.ConfigAPI");
                    /**
                     * 加载配置
                     * */
                    configRes.api.query({
                        queryAll: true
                    }).$promise.then(function(data) {
                            angular.forEach(data, function(item) {
                                ones.BaseConf[item.alias] = item.value;
                            });
                            ones.caches.setItem("ones.config", ones.BaseConf, 1);
                        });
                } catch (err) {}


                $http.get(ones.BaseConf.BSU+"FrontendRuntime/index/action/getI18n/lang/zh-cn").success(function(data) {
                    ones.caches.setItem("ones.i18n", data, ones.defaultCacheLevel);
                    $rootScope.i18n = data;
                    if(!$rootScope.i18n) {
                        throw("can't load i18n package.");
                    }
                });

                ones.caches.removeItem("ones.reloading");
            }
        }])
    ;
})();
