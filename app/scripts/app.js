'use strict';
    angular.module('ones', [
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ngRoute',
        'ngGrid',
        'ngAnimate',
        'mgcrea.ngStrap',
        'localytics.directives',
        'ui.utils',
        'ui.select',

        'ones.resources',
        'ones.passport',
        'ones.home',
        'ones.home.dashboard',
        'ones.jxc',
        'ones.crm',
        'ones.finance',
        'ones.produce',
        'ones.common',
        'ones.configModule',
        'ones.doWorkflow',
        'ones.statistics',

        'ones.commonView', //需要先加载模块，让模块路由优先匹配
//    'ones.service'
    ])
            /**
             * $http interceptor.
             * On 401 response – it stores the request and broadcasts 'event:loginRequired'.
             */
            .config(["$httpProvider", function($httpProvider) {
                    var interceptor = ['$rootScope', '$q', function(scope, $q) {
                            function success(response) {
                                if (parseInt(response.data.error) > 0) {
                                    scope.$broadcast('event:serverError', response.data.msg);
                                    return $q.reject(response);
                                } else {
                                    return response;
                                }
                            }
                            function error(response) {
                                var status = response.status;
                                var deferred = $q.defer();
                                if (401 === status) {
                                    scope.$broadcast('event:loginRequired', response.data);
                                    return deferred.promise;
                                } else if (403 === status) {
                                    scope.$broadcast('event:permissionDenied', response.data);
                                } else if (500 === status) {
                                    scope.$broadcast('event:serverError', response.data);
                                }
                                return $q.reject(response);
                            }

                            return function(promise) {
                                return promise.then(success, error);
                            };
                        }];
                    $httpProvider.responseInterceptors.push(interceptor);
                }])
    /**
     * Root Ctrl
     * */
    .controller('MainCtl', ["$scope", "$rootScope", "$location", "$http", "ones.config", "ComView", "WorkflowNodeRes",
        function($scope, $rootScope, $location, $http, conf, ComView, WorkflowNodeRes) {
            
            $scope.onesConf = conf;
            $scope.BSU = conf.BSU;
            $scope.BSURoot = conf.BSURoot;
            if(!$scope.BSURoot) {
                var tmp = conf.BSU.split("/").slice(0, -2);
                $scope.BSURoot = tmp.join("/");
            }

            $scope.$watch(function() {
                return $location.$$url;
            }, function() {
                $scope.currentURI = encodeURI(encodeURIComponent($location.$$url));
            });

            //监听全局事件
            $scope.$on("event:loginRequired", function() {
                window.location.href = 'index.html';
            });

            $scope.$on("event:permissionDenied", function(evt, msg) {
                msg = $rootScope.i18n.lang.messages[msg] || $rootScope.i18n.lang.messages.permissionDenied;
                ComView.alert(msg, "danger");
            });

            $scope.$on("event:serverError", function(evt, msg) {
                msg = $rootScope.i18n.lang.messages[msg] || $rootScope.i18n.lang.messages.serverError;
                ComView.alert(msg, "danger");
            });

            //屏蔽默认快捷键
            $scope.removeDefaultKey = function() {

            };


            /**
             * 监控路由变化
             * */
            $scope.$watch(function() {
                return $location.path();
            }, function() {
                /**
                 * 设置当前页面信息
                 * 两种URL模式： 普通模式 group/module/action
                 *             URL友好模式 group/action(list|add|edit)/module
                 * */
                var actionList = ['list', 'export', 'add', 'edit', 'addChild', 'viewChild', 'print'], fullPath, group, module, action;
                fullPath = $location.path().split("/").slice(1, 4);
                if (!fullPath[1]) {
                    return;
                }
                group = fullPath[0];
                fullPath[1] = fullPath[1].replace(/Bill/ig, ''); //将addBill, editBill转换为普通add,edit
                //友好模式
                if (actionList.indexOf(fullPath[1]) >= 0) {
                    module = fullPath[2].ucfirst();
                    action = fullPath[1];
                } else {
                    module = fullPath[1];
                    action = fullPath[2];
                }

                group = group ? group : "HOME";
                module = module ? module : "Index";
                action = action && isNaN(parseInt(action)) ? action : "list";
//                        console.log(module);
                $scope.currentPage = {};
                var urlmap = $rootScope.i18n.urlMap;
                if (group in urlmap) {
                    $scope.currentPage.group = urlmap[group].name;
                    if (module in urlmap[group].modules) {
                        $scope.currentPage.module = urlmap[group].modules[module].name;
                        if (action in urlmap[group].modules[module].actions) {
                            $scope.currentPage.action = urlmap[group].modules[module].actions[action] instanceof Array
                                    ? urlmap[group].modules[module].actions[action][0]
                                    : urlmap[group].modules[module].actions[action];
                            $scope.currentPage.actionDesc = urlmap[group].modules[module].actions[action] instanceof Array
                                    ? urlmap[group].modules[module].actions[action][1] : "";
                        }
                        if (!$scope.currentPage.action) {
                            $scope.currentPage.action = urlmap[group].modules[module].name;
                            $scope.currentPage.actionDesc = $rootScope.i18n.lang.actions[action];
                        }
                    }
                }
            });


            /**
             * 获取页面基本信息
             * @return {
             *  user: {},
             *  navs: {}
             * }
             * */
            $http.get(conf.BSU + "HOME/Index/index").success(function(data) {
                $rootScope.uesrInfo = data.user;
                $scope.$broadcast("initDataLoaded", data);
            });

            $scope.$on("initDataLoaded", function(event, data) {
                $scope.userInfo = data.user;
            });

        }])
    ;