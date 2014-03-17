'use strict';

var loginHash = $_GET("hash");
var ERP = angular.module('erp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'ngGrid',
    'ui.bootstrap',
    'ui.bootstrap.tpls',
    'erp.config',
    'erp.jxc'
//    'erp.service'
])
        /**
         * $http interceptor.
         * On 401 response – it stores the request and broadcasts 'event:loginRequired'.
         */
        .config(function($httpProvider) {
            var interceptor = ['$rootScope', '$q', function(scope, $q) {

                    function success(response) {
                        return response;
                    }

                    function error(response) {
                        var status = response.status;
                        if (401 === status) {
                            var deferred = $q.defer();
                            var req = {
                                config: response.config,
                                deferred: deferred
                            };
                            scope.$broadcast('event:loginRequired');
                            return deferred.promise;
                        }
                        return $q.reject(response);
                    }

                    return function(promise) {
                        return promise.then(success, error);
                    };
                }];
            $httpProvider.responseInterceptors.push(interceptor);
        })
        .run(function($http, $rootScope, $templateCache) {
            
            //设置HTTP请求默认头
            $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
            $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
            $http.defaults.transformRequest = function(data) {
                return angular.isObject(data) && String(data) !== '[object File]' ? jQuery.param(data) : data;
            };

            //载入默认模板
            if(CommonView.defaultTemplate.length >0) {
                for(i=0; i<CommonView.defaultTemplate.length; i++) {
                    $templateCache.put(CommonView.defaultTemplate[i][0],CommonView.defaultTemplate[i][1]);
                }
            }
            
        });




/**
 * Root Ctrl
 * */
ERP.controller('MainCtl', function($scope, $rootScope, $location, $http) {

    if (!loginHash) {
        window.location.href = 'index.html';
    }
    $rootScope.$on("event:loginRequired", function() {
        window.location.href = 'index.html';
    });

    /**
     * 加载语言包
     * */
    $http.get("scripts/i18n/zh-cn.json").success(function(data) {
        $scope.i18n = data;
        /**
         * 监控路由变化
         * */
        $scope.$watch(function() {
            return $location.path();
        }, function() {
            //设置当前页面信息
            var fullPath = $location.path().split("/").slice(1,4);
            var group = fullPath[0];
            var module= fullPath[1];
            var action= fullPath[2];
            group = group ? group : "HOME";
            module= module? module: "Index";
            action = action ? action : "Index";
            $scope.currentPage = {
                
            };
            
            if(group in $scope.i18n.urlMap) {
                $scope.currentPage.group = $scope.i18n.urlMap[group].name;
                if(module in $scope.i18n.urlMap[group].modules) {
                    $scope.currentPage.module = $scope.i18n.urlMap[group].modules[module].name;
                    if(action in $scope.i18n.urlMap[group].modules[module].actions) {
                        $scope.currentPage.action = $scope.i18n.urlMap[group].modules[module].actions[action][0];
                        $scope.currentPage.actionDesc = $scope.i18n.urlMap[group].modules[module].actions[action][1];
                    }
                }
            }
            
            
        });
    });

});

//var Svs = angular.module('erp.service', []);


/**
 * 通用提示信息显示。依赖ui.bootstrap
 * */
ERP.controller("AlertCtl", function($scope, $rootScope) {
    $scope.alerts = [];

    $rootScope.addAlert = function(msg, type, closeable) {
        type = type || "success";
        closeable = closeable || true,
                $scope.alerts.push({msg: msg, type: type, closeable: closeable});
    };

    $rootScope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };
});


