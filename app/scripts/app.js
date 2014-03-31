'use strict';

var loginHash = uriParamsGet('hash');
var ERP = angular.module('erp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'ngGrid',
    'ui.bootstrap',
    'ui.bootstrap.tpls',
    'localytics.directives',
    
    'erp.common',
    'erp.config',
    
    'erp.home',
    'erp.jxc'
//    'erp.service'
])
        /**
         * $http interceptor.
         * On 401 response – it stores the request and broadcasts 'event:loginRequired'.
         */
        .config(["$httpProvider", function($httpProvider) {
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
        }])
        .run(["$http", function($http) {
            //设置HTTP请求默认头
            $http.defaults.headers.common["sessionHash"] = loginHash;
            $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
            $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
            $http.defaults.transformRequest = function(data) {
                return angular.isObject(data) && String(data) !== '[object File]' ? jQuery.param(data) : data;
            };

        }]);

/**
 * Root Ctrl
 * */
ERP.controller('MainCtl', ["$scope", "$rootScope", "$location", "$http", "erp.config",
        function($scope, $rootScope, $location, $http, conf) {
            if (!loginHash) {
                window.location.href = 'index.html';
            }
            $rootScope.$on("event:loginRequired", function() {
                window.location.href = 'index.html';
            });
            
            $scope.alert = function(msg, type, timeout) {
                $scope.$broadcast("alert", {
                    msg: msg,
                    type: type,
                    timeout: timeout
                });
            };
            
            $scope.doWorkflow = function(event, node_id, selectedItems, res){
                selectedItems = selectedItems || [];
                if(!selectedItems.length || $(event.target).parent().hasClass("disabled")) {
                    return false;
                }
                res.doWorkflow({
                    workflow: true,
                    node_id: node_id,
                    id: selectedItems[0].id
                }).$promise.then(function(data){
                    $scope.$broadcast("gridData.changed");
                });
            };
            $scope.workflowActionDisabled = function(id, selectedItems) {
                selectedItems = selectedItems || [];
                if(!selectedItems.length) {
                    return true;
                }

                var result = true;
                for(var i=0;i<selectedItems.length;i++) {
                    var item = selectedItems[i];
                    if(!item["processes"]) {
                        result = true;
                        break;
                    }
                    for(var j=0;j<item.processes.nextNodes.length;j++) {
                        if(item.processes.nextNodes[j].id == id) {
                            result = false;
                            break;
                        }
                    }
                }
                return result;
            };
            $scope.workflowDisabled = function(selectedItems) {
                selectedItems = !selectedItems || [];
                if(!selectedItems.length) {
                    return true;
                }
                var next = null;
                var disable = true;
                for(var i=0;i<selectedItems.length;i++) {
                    var item = selectedItems[i];
                    if(!item["processes"]) {
                        disable = true;
                        break;
                    }
                    if(next !== null && next !== item["processes"]["nextActions"]) {
                        disable = true;
                        break;
                    }
                    disable = false;
                    next = item["processes"]["nextActions"];
                }
                return disable;
            };

            /**
             * 加载语言包
             * */
            $http.get("scripts/i18n/zh-cn.json").success(function(data) {
                $rootScope.i18n = data;
                /**
                 * 监控路由变化
                 * */
                $scope.$watch(function() {
                    return $location.path();
                }, function() {
                    //设置当前页面信息
                    var fullPath = $location.path().split("/").slice(1, 4);
                    var group = fullPath[0];
                    var module = fullPath[1];
                    var action = fullPath[2];
                    group = group ? group : "HOME";
                    module = module ? module : "Index";
                    action = action && isNaN(parseInt(action)) ? action : "index";
                    $scope.currentPage = {};
                    if (group in $rootScope.i18n.urlMap) {
                        $scope.currentPage.group = $rootScope.i18n.urlMap[group].name;
                        if (module in $rootScope.i18n.urlMap[group].modules) {
                            $scope.currentPage.module = $rootScope.i18n.urlMap[group].modules[module].name;
                            if (action in $rootScope.i18n.urlMap[group].modules[module].actions) {
                                $scope.currentPage.action = $rootScope.i18n.urlMap[group].modules[module].actions[action][0];
                                $scope.currentPage.actionDesc = $rootScope.i18n.urlMap[group].modules[module].actions[action][1];
                            }
                        }
                    }
                });

                /**
                 * 获取页面基本信息
                 * */
                $http.get(conf.BSU+"HOME/Index/index").success(function(data){
                    $rootScope.uesrInfo = data.user;
                    $scope.$broadcast("initDataLoaded", data);
                });
                
                $scope.$on("initDataLoaded", function(event, data){
                    $scope.userInfo = data.user;
                });
                
            });

        }]);

        /**
         * 通用提示信息显示。依赖ui.bootstrap
         * */
        ERP.controller("AlertCtl", ["$scope", "$rootScope", "$q", function($scope, $rootScope, $q) {
            $scope.alert = {};
            
            $scope.$on("alert", function(event, data){
                $scope.alert.type = data.type || "warning";
                $scope.alert.msg  = data.msg;
                $scope.alert.closeAble  = true;
                $scope.alert.autoClose = data.timeout === false ? false : (isNaN(data.timeout) === false ? data.timeout : '3000');
            });
            
            $scope.closeAlert = function() {
                $scope.alert = {};
            };
            
            var closeAlert = function(timeout){
                var deferred = $q.defer();
                setTimeout(function(){
                    $scope.$apply(function(){
                        $scope.closeAlert();
                    });
                }, timeout);
                return deferred.promise;
            };
            $scope.$watch(function(){
                return $scope.alert;
            }, function(){
                if($scope.alert.autoClose !== false) {
                    var timeout = $scope.alert.autoClose == false ? 1440000 : 5000;
                    var promise = closeAlert(timeout);
                }
            });
            
//            
//            function asyncGreet(name) {
//                var deferred = $q.defer();
//
//                setTimeout(function() {
//                  // since this fn executes async in a future turn of the event loop, we need to wrap
//                  // our code into an $apply call so that the model changes are properly observed.
//                  $scope.$apply(function() {
//                    
//                  });
//                }, 1000);
//
//                return deferred.promise;
//              }
//
//              var promise = asyncGreet('Robin Hood');
//              promise.then(function(greeting) {
//                alert('Success: ' + greeting);
//              }, function(reason) {
//                alert('Failed: ' + reason);
//              }, function(update) {
//                alert('Got notification: ' + update);
//              });
            
            return;
            
            $scope.$watch(function(){
                return $rootScope.alert;
            }, function(){
                if(!$rootScope.alert) {
                    return;
                }
                $scope.alerts.push($rootScope.alert);
            });

            $rootScope.addAlert = function(msg, type, closeable) {
                type = type || "success";
                closeable = closeable || true,
                        $scope.alerts.push({msg: msg, type: type, closeable: closeable});
            };

            $rootScope.closeAlert = function(index) {
                $scope.alerts.splice(index, 1);
            };
        }]);


